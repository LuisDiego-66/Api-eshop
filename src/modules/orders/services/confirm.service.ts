import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { OrderStatus, OrderType, PaymentType } from '../enums';
import { ReservationStatus } from '../../stock-reservations/enum/reservation-status.enum';

import { MailService } from 'src/mail/mail.service';

import { Order } from '../entities/order.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Transaction } from 'src/modules/variants/entities/transaction.entity';
import { BNBPayload } from 'src/modules/payments/interfaces/bnb-payload.interface';
import { StockReservation } from 'src/modules/stock-reservations/entities/stock-reservation.entity';

@Injectable()
export class ConfirmService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

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

      //! cambia a null
      order.expiresAt = null;
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

        .innerJoinAndSelect('order.items', 'items') //* ITEMS
        .innerJoinAndSelect('items.variant', 'variant') //* VARIANTS

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

      //! cambia a null
      order.expiresAt = null;
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

      // --------------------------------------------
      // 6. Se obtiene la orden completa
      // --------------------------------------------

      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')

        .innerJoinAndSelect('order.customer', 'customer')
        .innerJoinAndSelect('order.address', 'address')
        .innerJoinAndSelect('order.shipment', 'shipment')

        .where('order.id = :id', { id: orderId })
        .getOne();

      await queryRunner.commitTransaction();

      // --------------------------------------------
      // 7. Se envia el correo
      // --------------------------------------------

      if (order.type === OrderType.ONLINE) {
        await this.mailService.sendMail({
          to: orderEntity?.customer?.email,

          orderNumber: orderEntity?.id.toString(),
          orderDate: orderEntity?.createdAt.toISOString().split('T')[0],
          totalPrice: orderEntity?.totalPrice,

          customerName: orderEntity?.customer?.name,
          customerEmail: orderEntity?.customer?.email,
          customerPhone: orderEntity?.customer?.phone || '',

          shippingAddress: orderEntity?.address,
          shippingCity: orderEntity?.address?.city,
          shippingCountry: orderEntity?.address?.country,
        });
      }

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ============================================================================================== */
  //?                         Confirm_Order_For_Edit                                                 */
  //? ============================================================================================== */

  async confirmOrderForEdit(
    orderId: number,
    externalQueryRunner?: QueryRunner,
  ) {
    const isExternal = !!externalQueryRunner;
    const queryRunner =
      externalQueryRunner ?? this.dataSource.createQueryRunner();

    if (!isExternal) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      // --------------------------------------------
      // 1. Obtener orden PENDING con bloqueo
      // --------------------------------------------

      const order = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .innerJoinAndSelect('order.items', 'items')
        .innerJoinAndSelect('items.variant', 'variant')

        .where('order.id = :id', { id: orderId })
        .andWhere('order.payment_type IN (:...payments)', {
          payments: [PaymentType.CASH],
        })
        .andWhere('order.expiresAt > NOW()')
        .getOne();

      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      // --------------------------------------------
      // 2. Actualizar orden a SENT
      // --------------------------------------------

      //! cambia a null
      order.expiresAt = null;
      order.edited = true;
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

      if (!isExternal) await queryRunner.commitTransaction();

      return order;
    } catch (error) {
      if (!isExternal) await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      if (!isExternal) await queryRunner.release();
    }
  }
}
