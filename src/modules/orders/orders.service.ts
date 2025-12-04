import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThanOrEqual, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { paginate } from 'src/common/pagination/paginate';
import { OrderPaginationDto } from './pagination/order-pagination.dto';
import {
  ChangeStatusDto,
  CreateOrderInStoreDto,
  CreateOrderOnlineDto,
} from './dto';

import { OrderStatus, OrderType, PaymentType } from './enums';
import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';

import { CreateOrder } from './services/create.service';
import { CancelOrder } from './services/cancel.service';
import { UpdateOrder } from './services/update.service';

import { Order } from './entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Transaction } from '../variants/entities/transaction.entity';
import { StockReservation } from '../stock-reservations/entities/stock-reservation.entity';
import { AddressType } from '../addresses/enums/address-type.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly createOrder: CreateOrder,
    private readonly cancelOrder: CancelOrder,
    private readonly updateOrder: UpdateOrder,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                         Create_Order_In_Store                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createOrderInStore(dto: CreateOrderInStoreDto) {
    if (!Object.values(PaymentType).includes(dto.payment_type)) {
      throw new Error('Invalid payment type');
    }

    return this.createOrder.createOrderBase({
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
    return this.createOrder.createOrderBase({
      dto,
      buyer,
      type: OrderType.ONLINE,
      payment_type: PaymentType.QR,
    });
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
  //?                               Confirm_Order_QR                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  //async confirmOrderQr(qrDataInterface: any) {}

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
  //?                                         Update                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async update(orderId: number, items: string) {
    return this.updateOrder.update(orderId, items);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                   Cancel_Order                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async cancel(orderId: number) {
    return this.cancelOrder.cancel(orderId);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                  Change_Status                                                 */
  //? ---------------------------------------------------------------------------------------------- */
  async changeStatus(id: number, changeStatus: ChangeStatusDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    /*     await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // --------------------------------------------
      // 1. Obtener la orden pagada
      // --------------------------------------------

      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .innerJoinAndSelect('order.addres', 'address')

        .where('order.id = :id', { id })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PAID],
        })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!order) {
        throw new NotFoundException(`Order ${order} not found or not paid`);
      }
      // --------------------------------------------
      // 2. cambiar el estado
      // --------------------------------------------
      if (
        order.type === OrderType.ONLINE &&
        order.address?.type === AddressType.INTERNATIONAL
      ) {
        if (changeStatus.dhl_code) {
          order.dhl_code = changeStatus.dhl_code;
          order.status = OrderStatus.SENT;
        } else {
          throw new BadRequestException(
            'DHL code is required for international orders',
          );
        }
      } else if()






    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    } */
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
