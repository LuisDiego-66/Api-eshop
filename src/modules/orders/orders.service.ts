import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, QueryRunner, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/paginate';
import { CreateOrderInStoreDto, CreateOrderOnlineDto } from './dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';
import { OrderStatus, OrderType } from './enums';

import { StockReservationsService } from '../stock-reservations/stock-reservations.service';
import { VariantsService } from '../variants/variants.service';
import { PricingService } from './pricing.service';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { StockReservation } from '../stock-reservations/entities/stock-reservation.entity';
import { Transaction } from '../variants/entities/transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Variant } from '../variants/entities/variant.entity';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { Item } from './entities/item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly pricingService: PricingService,
    private readonly variantsService: VariantsService,
    private readonly stockReservationsService: StockReservationsService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                         Create Order In Store                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createOrderInStore(dto: CreateOrderInStoreDto) {
    return this.createOrderBase({
      dto,
      buyer: null,
      isOnline: false,
    });
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                           Create Order Online                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createOrderOnline(dto: CreateOrderOnlineDto, buyer: User | Customer) {
    if (!(buyer instanceof Customer)) {
      throw new BadRequestException('Only customers can create online orders');
    }
    return this.createOrderBase({
      dto,
      buyer,
      isOnline: true,
    });
  }

  //? ---------------------------------------------------------------------------------------------- */

  private async createOrderBase({
    dto,
    buyer,
    isOnline,
  }: {
    dto: CreateOrderInStoreDto | CreateOrderOnlineDto;
    buyer?: Customer | null;
    isOnline: boolean;
  }) {
    const { items: token, type } = dto;

    const rePricing = await this.pricingService.rePrice(token);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //! Crear la orden base
      const orderData: Partial<Order> = {
        type,
        totalPrice: rePricing.total,
      };

      if (isOnline) {
        const { shipment, address } = dto as CreateOrderOnlineDto;
        Object.assign(orderData, {
          customer: { id: buyer!.id },
          shipment: { id: shipment },
          address: { id: address },
        });
      }

      const newOrder = queryRunner.manager.create(Order, orderData);
      await queryRunner.manager.save(newOrder);

      //! Crear los items y reservas
      for (const item of rePricing.items) {
        await this.handleItemCreationWithLock(queryRunner, newOrder, item);
      }

      //! Confirmar la transacción
      await queryRunner.commitTransaction();

      //! Retornar la orden creada
      return await this.findOne(newOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */

  private async handleItemCreationWithLock(
    queryRunner: QueryRunner,
    order: Order,
    item: {
      variantId: number;
      quantity: number;
      unit_price: number;
      discountValue: number;
      totalPrice: string;
    },
  ) {
    //! Verificar stock disponible con bloqueo
    const available = await this.variantsService.getAvailableStockWithLock(
      queryRunner,
      item.variantId,
    );

    if (available < item.quantity) {
      throw new BadRequestException(
        `Insufficient stock for variant ID: ${item.variantId}`,
      );
    }

    //! Bloquear la variante para escritura
    const variant = await queryRunner.manager.findOne(Variant, {
      where: { id: item.variantId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ID ${item.variantId} not found`);
    }

    //! Crear el item de la orden
    const orderItem = queryRunner.manager.create(Item, {
      order: { id: order.id },
      variant: { id: variant.id },
      quantity: item.quantity,
      unit_price: item.unit_price.toString(),
      discountValue: item.discountValue,
      totalPrice: item.totalPrice,
    });
    await queryRunner.manager.save(orderItem);

    //! Crear reserva de stock
    await this.stockReservationsService.createReservation(
      queryRunner.manager,
      variant.id,
      order.id,
      item.quantity,
    );
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                            ConfirmOrderInStore                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async confirmOrderManual(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write') //! solo bloquea "order"
        .innerJoinAndSelect('order.items', 'items') //! los items de la order
        .innerJoinAndSelect('items.variant', 'variant') //! las variantes de los items
        .where('order.id = :id', { id: orderId })
        .andWhere('order.status = :status', { status: OrderStatus.PENDING })
        .andWhere('order.type = :type', { type: OrderType.IN_STORE })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending or not in-store`,
        );
      }

      //! Actualizar el estado de la orden a PAID
      order.status = OrderStatus.PAID;
      await queryRunner.manager.save(order);

      //! Actualizar las reservas a PAID
      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.PAID })
        .where('orderId = :orderId', { orderId })
        .andWhere('status = :status', { status: ReservationStatus.PENDING })
        .andWhere('expiresAt > NOW()') //! condición de no expirada
        .execute();

      //! Crear las transacciones negativas de stock
      const transactions = order.items.map((item) =>
        queryRunner.manager.create(Transaction, {
          quantity: item.quantity * -1,
          variant: { id: item.variant.id },
        }),
      );
      await queryRunner.manager.save(transactions);

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                     GenerateQr                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  generateQr() {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                   ConfirmOrder                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async confirmOrderQr(qrDataInterface: any) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                    CancelOrder                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async cancelOrder(orderId: number) {
    //! revisar
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write') //! solo bloquea "order"
        .where('order.id = :id', { id: orderId })
        .andWhere('order.status = :status', { status: OrderStatus.PENDING })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!orderEntity) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending`,
        );
      }

      orderEntity.status = OrderStatus.CANCELLED;
      const order = await queryRunner.manager.save(Order, orderEntity);

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.CANCELLED })
        .where('orderId = :orderId', { orderId })
        .andWhere('status = :status', { status: ReservationStatus.PENDING })
        .andWhere('expiresAt > NOW()') //! condición de no expirada
        .execute();

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    return paginate(
      this.orderRepository,
      {
        relations: {
          items: { variant: true },
          customer: true,
          shipment: true,
          address: true,
        },
      },
      pagination,
    );
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: { variant: true },
        customer: true,
        shipment: true,
        address: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       Expired                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async expireOrders() {
    await this.orderRepository.update(
      { status: OrderStatus.PENDING, expiresAt: LessThan(new Date()) },
      { status: OrderStatus.EXPIRED },
    );
  }
}
