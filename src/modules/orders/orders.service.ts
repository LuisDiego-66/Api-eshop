import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  LessThan,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
} from 'typeorm';

import { paginate } from 'src/common/pagination/paginate';
import { OrderPaginationDto } from './pagination/order-pagination.dto';
import { CreateOrderInStoreDto, CreateOrderOnlineDto } from './dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';
import { OrderStatus, OrderType, PaymentType } from './enums';

import { StockReservationsService } from '../stock-reservations/stock-reservations.service';
import { VariantsService } from '../variants/variants.service';
import { PricingService } from './pricing.service';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { StockReservation } from '../stock-reservations/entities/stock-reservation.entity';
import { Transaction } from '../variants/entities/transaction.entity';
import { Customer } from '../customers/entities/customer.entity';

import { Variant } from '../variants/entities/variant.entity';
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
  //?                         Create_Order_In_Store                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createOrderInStore(dto: CreateOrderInStoreDto) {
    if (!Object.values(PaymentType).includes(dto.payment_type)) {
      throw new Error('Invalid payment type');
    }

    return this.createOrderBase({
      dto,
      type: OrderType.IN_STORE,
      payment_type: dto.payment_type,
    });
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                           Create_Order_Online                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createOrderOnline(dto: CreateOrderOnlineDto, buyer: Customer) {
    if (!(buyer instanceof Customer)) {
      throw new BadRequestException('Only customers can create online orders');
    }
    return this.createOrderBase({
      dto,
      buyer,
      type: OrderType.ONLINE,
      payment_type: PaymentType.QR,
    });
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  private async createOrderBase({
    dto,
    buyer,
    type,
    payment_type,
  }: {
    dto: CreateOrderInStoreDto | CreateOrderOnlineDto;
    buyer?: Customer;
    type: OrderType;
    payment_type: PaymentType;
  }) {
    const { items: token } = dto;

    const rePricing = await this.pricingService.rePrice(token);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Se crea la order Base
      // --------------------------------------------

      const orderData: Partial<Order> = {
        type,
        totalPrice: rePricing.total,
      };

      if (type === OrderType.ONLINE && buyer) {
        const { shipment, address } = dto as CreateOrderOnlineDto;
        Object.assign(orderData, {
          customer: { id: buyer.id },
          shipment: { id: shipment },
          address: { id: address },
        });
      }

      // --------------------------------------------
      // 2. Se agrega el tipo de pago (QR, CASH, CARD)
      // --------------------------------------------

      const newOrder = queryRunner.manager.create(Order, {
        ...orderData,
        payment_type,
      });
      await queryRunner.manager.save(newOrder);

      // --------------------------------------------
      // 3. Se crea los items y las reservas de stock
      // --------------------------------------------

      for (const item of rePricing.items /* success */) {
        await this.handleItemCreationWithLock(queryRunner, newOrder, item);
      }

      // --------------------------------------------
      // 4. Commit Transaction
      // --------------------------------------------

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
    // --------------------------------------------
    // 1. Verificar stock disponible
    // --------------------------------------------

    const available = await this.variantsService.getAvailableStockWithLock(
      queryRunner,
      item.variantId,
    );

    if (available < item.quantity) {
      throw new BadRequestException(
        `Insufficient stock for variant ID: ${item.variantId}`,
      );
    }

    // --------------------------------------------
    // 2. Obtener la variante con lock
    // --------------------------------------------

    const variant = await queryRunner.manager
      .createQueryBuilder(Variant, 'v')
      .setLock('pessimistic_write')
      .where('v.id = :id', { id: item.variantId })
      .getOne();

    if (!variant) {
      throw new NotFoundException(`Variant ID ${item.variantId} not found`);
    }

    // --------------------------------------------
    // 3. Crear el item de la order
    // --------------------------------------------

    const orderItem = queryRunner.manager.create(Item, {
      order: { id: order.id },
      variant: { id: variant.id },
      quantity: item.quantity,
      unit_price: item.unit_price.toString(),
      discountValue: item.discountValue,
      totalPrice: item.totalPrice,
    });
    await queryRunner.manager.save(orderItem);

    // --------------------------------------------
    // 4. Crear la reserva de stock
    // --------------------------------------------

    await this.stockReservationsService.createReservation(
      queryRunner.manager,
      variant.id,
      order.id,
      item.quantity,
    );
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                          Confirm_Order_Manual                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async confirmOrderManual(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Obtener la orden con lock
      // --------------------------------------------

      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write') //! solo bloquea "order"

        .innerJoinAndSelect('order.items', 'items') //* Items
        .innerJoinAndSelect('items.variant', 'variant') //* Variants
        .where('order.id = :id', { id: orderId })

        .andWhere('order.status = :status', { status: OrderStatus.PENDING }) //! debe estar pendiente
        .andWhere('order.payment_type IN (:...payments)', {
          payments: [PaymentType.CASH, PaymentType.CARD], //! no debe ser qr
        })
        .andWhere('order.type = :type', { type: OrderType.IN_STORE }) //! debe ser in-store

        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending or not in-store`,
        );
      }

      // --------------------------------------------
      // 2. Actualizar la orden a SENT
      // --------------------------------------------

      order.status = OrderStatus.SENT;
      await queryRunner.manager.save(order);

      // --------------------------------------------
      // 3. Actualizar las reservas de stock a PAID
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.PAID })
        .where('orderId = :orderId', { orderId })
        .andWhere('status = :status', { status: ReservationStatus.PENDING })
        .andWhere('expiresAt > NOW()') //! condición de no expirada
        .execute();

      // --------------------------------------------
      // 4. Se crean transacciones negativas
      // --------------------------------------------

      const transactions = order.items.map((item) =>
        queryRunner.manager.create(Transaction, {
          quantity: item.quantity * -1,
          variant: { id: item.variant.id },
          order: order, //! se asigna la order a la transaccion negativa
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
  //?                                    Generate_Qr                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  //generateQr() {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                               Confirm_Order_QR                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  //async confirmOrderQr(qrDataInterface: any) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                   Cancel_Order                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async cancelOrder(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Obtener la orden con lock
      // --------------------------------------------

      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write') //! solo bloquea "order"
        .where('order.id = :id', { id: orderId })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.SENT],
        })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!orderEntity) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending / paid`,
        );
      }

      // --------------------------------------------
      // 2. Actualizar a CANCELLED o deletedAt si PENDING
      // --------------------------------------------

      orderEntity.status =
        orderEntity.status === OrderStatus.PAID ||
        orderEntity.status === OrderStatus.SENT
          ? OrderStatus.CANCELLED
          : orderEntity.status;

      orderEntity.deletedAt =
        orderEntity.status === OrderStatus.PENDING
          ? new Date()
          : orderEntity.deletedAt;

      const order = await queryRunner.manager.save(Order, orderEntity);

      // --------------------------------------------
      // 3. Actualizar las reservas a CANCELLED
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.CANCELLED })
        .where('orderId = :orderId', { orderId })
        .andWhere('status = :status', { status: ReservationStatus.PENDING })
        .andWhere('expiresAt > NOW()') //! condición de no expirada
        .execute();

      // --------------------------------------------
      // 4. Se eliminan las transacciones de la orden
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(Transaction)
        .set({ deletedAt: new Date() })
        .where('orderId = :orderId', { orderId })
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

  async findAll(pagination: OrderPaginationDto) {
    const options: any = {
      where: {},
    };

    if (pagination.type) {
      options.where.type = pagination.type;
    }
    if (pagination.days) {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - pagination.days);

      options.where = {
        ...options.where,
        createdAt: MoreThanOrEqual(dateFrom),
      };
    }

    return paginate(
      this.orderRepository,
      {
        ...options,
        relations: {
          items: { variant: { productColor: { product: true } } },
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
