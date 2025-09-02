import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateOrderDto } from './dto/create-order.dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';
import { OrderStatus } from './enums';

import { StockReservationsService } from '../stock-reservations/stock-reservations.service';
import { VariantsService } from '../variants/variants.service';
import { PricingService } from './pricing.service';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { StockReservation } from '../stock-reservations/entities/stock-reservation.entity';
import { Variant } from '../variants/entities/variant.entity';
import { Item, Order } from './entities';

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
  //?                                  Create Order                                                  */
  //? ---------------------------------------------------------------------------------------------- */
  async createOrder(createOrderDto: CreateOrderDto) {
    const { items: token, type, customer, shipment, address } = createOrderDto;

    //! Reprice
    const rePricing = await this.pricingService.rePrice(token);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //! Creacion de la orden
      const newOrder = queryRunner.manager.create(Order, {
        type,
        customer: customer ? { id: customer } : null,
        shipment: shipment ? { id: shipment } : null,
        address: address ? { id: address } : null,
        totalPrice: rePricing.total,
      });
      await queryRunner.manager.save(newOrder);

      for (const item of rePricing.items) {
        //! Bloqueo pesimista sobre la creacion e insercion de reservas sobre la variante
        const available = await this.variantsService.getAvailableStockWithLock(
          queryRunner,
          item.variantId,
        );

        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${item.variantId}`,
          );
        }

        //! Bloqueo pesimista sobre la variante
        const variant = await queryRunner.manager.findOne(Variant, {
          where: { id: item.variantId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant)
          throw new NotFoundException(`Variant ${item.variantId} not found`);

        //! Creacion del item de orden
        const orderItem = queryRunner.manager.create(Item, {
          order: { id: newOrder.id },
          variant: { id: variant.id },
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          discountValue: item.discountValue,
          totalPrice: item.totalPrice,
        });
        await queryRunner.manager.save(orderItem);

        //! Creacion de la reserva de stock
        await this.stockReservationsService.createReservation(
          queryRunner.manager,
          variant.id,
          newOrder.id,
          item.quantity,
        );
      }

      await queryRunner.commitTransaction();
      return await this.findOne(newOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                   ConfirmOrder                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async confirmOrder(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write') //! solo bloquea "order"
        .where('order.id = :id', { id: orderId })
        .andWhere('order.status = :status', { status: OrderStatus.PENDING })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending`,
        );
      }

      order.status = OrderStatus.PAID;
      await queryRunner.manager.save(order);

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.PAID })
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
  //?                                   CancelOrder                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async cancelOrder(orderId: number) {
    //! revisar
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write') //! solo bloquea "order"
        .where('order.id = :id', { id: orderId })
        .andWhere('order.status = :status', { status: OrderStatus.PENDING })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending`,
        );
      }

      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

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
    const { limit = 10, offset = 0 } = pagination;

    const orders = await this.orderRepository.find({
      take: limit,
      skip: offset,
      relations: {
        items: { variant: { product: true } },
        customer: true,
        shipment: true,
        address: true,
      },
    });

    return orders;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: { variant: { product: true } },
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
}
