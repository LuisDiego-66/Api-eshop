import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
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

import { BNBPayload } from '../payments/interfaces/bnb-payload.interface';

import { OrderStatus, OrderType, PaymentType } from './enums';
import { AddressType } from '../addresses/enums/address-type.enum';
import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';

import { CreateOrder } from './services/create.service';
import { CancelOrder } from './services/cancel.service';
import { UpdateOrder } from './services/update.service';
import { CustomersService } from '../customers/customers.service';

import { Order } from './entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Transaction } from '../variants/entities/transaction.entity';
import { StockReservation } from '../stock-reservations/entities/stock-reservation.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @Inject(forwardRef(() => CustomersService))
    private readonly customersService: CustomersService,

    private readonly dataSource: DataSource,
    private readonly createOrder: CreateOrder,
    private readonly cancelOrder: CancelOrder,
    private readonly updateOrder: UpdateOrder,
  ) {}

  //? ============================================================================================== */
  //?                         Create_Order_In_Store                                                  */
  //? ============================================================================================== */

  async createOrderInStore(dto: CreateOrderInStoreDto) {
    if (!Object.values(PaymentType).includes(dto.payment_type)) {
      throw new Error('Invalid payment type');
    }

    //* Crear orden
    return this.createOrder.createOrderBase({
      dto,
      type: OrderType.IN_STORE,
      payment_type: dto.payment_type,
    });
  }

  //? ============================================================================================== */
  //?                           Create_Order_Online                                                  */
  //? ============================================================================================== */

  async createOrderOnline(dto: CreateOrderOnlineDto, buyer: Customer) {
    if (!(buyer instanceof Customer)) {
      throw new BadRequestException('Only customers can create online orders');
    }
    //* Actualizar datos del cliente
    await this.customersService.update(buyer.id, {
      phone: dto.phone,
      name: dto.name,
    });

    //* Crear orden
    return this.createOrder.createOrderBase({
      dto,
      buyer,
      type: OrderType.ONLINE,
      payment_type: PaymentType.QR,
    });
  }

  //? ============================================================================================== */
  //?                          Confirm_Order_Manual                                                  */
  //? ============================================================================================== */

  async confirmOrderManual(orderId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Obtener orden PENDING con bloqueo
      // --------------------------------------------

      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .innerJoinAndSelect('order.items', 'items') //* ITEMS
        .innerJoinAndSelect('items.variant', 'variant') //* VARIANTS

        .where('order.id = :id', { id: orderId })
        .andWhere('order.status = :status', { status: OrderStatus.PENDING }) //* DEBE ESTAR PENDING
        .andWhere('order.payment_type IN (:...payments)', {
          payments: [PaymentType.CASH, PaymentType.CARD], //* NO QR
        })
        .andWhere('order.type = :type', { type: OrderType.IN_STORE }) //* DEBE SER IN_STORE
        .andWhere('order.expiresAt > NOW()')

        .getOne();

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending or not in-store`,
        );
      }

      // --------------------------------------------
      // 2. Actualizar orden a SENT
      // --------------------------------------------

      order.status = OrderStatus.SENT;
      await queryRunner.manager.save(order);

      // --------------------------------------------
      // 3. Actualizar reservas de stock a PAID
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

  //? ============================================================================================== */
  //?                               Confirm_Order_QR                                                 */
  //? ============================================================================================== */

  async confirmOrderQr(body: BNBPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { additionalData: orderId, ...data } = body;

      // --------------------------------------------
      // 1. Orden PENDING, tipo QR, no expirada
      // --------------------------------------------

      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')

        .where('order.id = :id', { id: orderId })
        .andWhere('order.status = :status', { status: OrderStatus.PENDING }) //* DEBE ESTAR PENDING
        .andWhere('order.payment_type IN (:...payments)', {
          payments: [PaymentType.QR], //* DEBE SER QR
        })
        .andWhere('order.expiresAt > NOW()')

        .getOne();

      if (!order) {
        throw new NotFoundException(
          `Order ${orderId} not found, not pending or not type QR`,
        );
      }

      // --------------------------------------------
      // 2. Actualizar orden a SENT o PAID
      // --------------------------------------------

      if (order.type === OrderType.IN_STORE) {
        //*------SENT si es IN_STORE
        order.status = OrderStatus.SENT;
        await queryRunner.manager.save(Order, order);
      } else {
        //*------PAID si es ONLINE
        order.status = OrderStatus.PAID;
        await queryRunner.manager.save(Order, order);
      }

      // --------------------------------------------
      // 3. Actualizar reservas de stock a PAID
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
      await queryRunner.manager.save(Transaction, transactions);

      // --------------------------------------------
      // 5. Se crea el Payment
      // --------------------------------------------

      const payment = queryRunner.manager.create(Payment, {
        qrId: data.QRId,
        sourceBankId: data.sourceBankId.toString(),
        //saver: data.originName,
        amount: data.amount.toString(),
        gloss: data.Gloss,
        order: order,
      });
      await queryRunner.manager.save(Payment, payment);

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

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

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  async findOne(id: number, customer?: Customer) {
    let where: any = { id };

    if (customer) {
      where = { ...where, customer: { id: customer.id } };
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: {
        items: { variant: { productColor: true } },
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

  //? ============================================================================================== */
  //?                                         Update                                                 */
  //? ============================================================================================== */

  async update(orderId: number, items: string) {
    return this.updateOrder.update(orderId, items);
  }

  //? ============================================================================================== */
  //?                                   Cancel_Order                                                 */
  //? ============================================================================================== */

  async cancel(orderId: number) {
    return this.cancelOrder.cancel(orderId);
  }

  //? ============================================================================================== */
  //?                                  Change_Status                                                 */
  //? ============================================================================================== */

  async changeStatus(id: number, changeStatus: ChangeStatusDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Obtener orden PAID con bloqueo
      // --------------------------------------------

      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('order.address', 'address')
        .where('order.id = :id', { id })
        .andWhere('order.status = :status', { status: OrderStatus.PAID })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!orderEntity) {
        throw new NotFoundException(`Order ${id} not found or not paid`);
      }

      // --------------------------------------------
      // 2. Validaciones
      // --------------------------------------------

      const isOnline = orderEntity.type === OrderType.ONLINE;
      const isInternational =
        orderEntity.address?.type === AddressType.INTERNATIONAL;
      const isNational = orderEntity.address?.type === AddressType.NATIONAL;

      if (isOnline && isInternational && !changeStatus.dhl_code) {
        throw new BadRequestException(
          'DHL code is required for international orders',
        );
      }

      // --------------------------------------------
      // 3. Cambio de status
      // --------------------------------------------

      if (isOnline && isInternational) {
        orderEntity.dhl_code = changeStatus.dhl_code!;
        orderEntity.status = OrderStatus.SENT;
      }

      if (isOnline && isNational) {
        orderEntity.status = OrderStatus.SENT;
      }

      // --------------------------------------------
      // 4. Guardar cambios
      // --------------------------------------------

      const updatedOrder = await queryRunner.manager.save(orderEntity);
      await queryRunner.commitTransaction();

      return updatedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ============================================================================================== */
  //?                                       Expired                                                  */
  //? ============================================================================================== */

  async expireOrders() {
    await this.orderRepository.update(
      { status: OrderStatus.PENDING, expiresAt: LessThan(new Date()) },
      { status: OrderStatus.EXPIRED },
    );
  }
}
