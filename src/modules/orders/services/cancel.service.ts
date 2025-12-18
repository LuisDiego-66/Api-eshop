import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { OrderStatus } from '../enums';
import { ReservationStatus } from '../../stock-reservations/enum/reservation-status.enum';

import { Order } from '../entities/order.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Transaction } from 'src/modules/variants/entities/transaction.entity';
import { StockReservation } from 'src/modules/stock-reservations/entities/stock-reservation.entity';

@Injectable()
export class CancelService {
  constructor(private readonly dataSource: DataSource) {}

  //? ============================================================================================== */
  //?                                   Cancel_Order                                                 */
  //? ============================================================================================== */

  async cancel(orderId: number, externalQueryRunner?: QueryRunner) {
    // --------------------------------------------
    // 1. Iniciar QueryRunner
    // --------------------------------------------

    const isExternal = !!externalQueryRunner;
    const queryRunner =
      externalQueryRunner ?? this.dataSource.createQueryRunner();

    if (!isExternal) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      // --------------------------------------------
      // 2. Obtener la orden con lock
      // --------------------------------------------

      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .where('order.id = :id', { id: orderId })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.SENT],
        })
        .andWhere(
          `(
            order.expiresAt > NOW()
            OR (
              order.expiresAt IS NULL
              AND order.status IN (:...confirmedStatuses)
            )
          )`,
          {
            confirmedStatuses: [OrderStatus.PAID, OrderStatus.SENT],
          },
        )
        .getOne();

      if (!orderEntity) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending / paid / sent`,
        );
      }

      // --------------------------------------------
      // 3. CANCELLED y deletedAt si PENDING
      // --------------------------------------------

      orderEntity.deletedAt =
        orderEntity.status === OrderStatus.PENDING
          ? new Date()
          : orderEntity.deletedAt;

      orderEntity.status = OrderStatus.CANCELLED;
      orderEntity.expiresAt = null;

      await queryRunner.manager.save(Order, orderEntity);

      // --------------------------------------------
      // 4. Actualizar las reservas a CANCELLED
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.CANCELLED })

        .where('orderId = :orderId', { orderId })
        .andWhere('status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING, ReservationStatus.PAID],
        })
        .andWhere('expiresAt > NOW()') //! condición de no expirada
        .execute();

      // --------------------------------------------
      // 5. Se eliminan las transacciones
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(Transaction)
        .set({ deletedAt: new Date() })
        .where('orderId = :orderId', { orderId })
        .execute();

      if (!isExternal) await queryRunner.commitTransaction();

      return orderEntity;
    } catch (error) {
      if (!isExternal) await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
      throw error; //! por typescript
    } finally {
      if (!isExternal) await queryRunner.release();
    }
  }

  //? ============================================================================================== */
  //?                          Cancel_Order_For_Edit                                                 */
  //? ============================================================================================== */

  async cancelForEdit(orderId: number) {
    // --------------------------------------------
    // 1. Iniciar QueryRunner
    // --------------------------------------------

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 2. Obtener la orden con lock
      // --------------------------------------------

      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .where('order.id = :id', { id: orderId })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PAID, OrderStatus.SENT],
        })
        .andWhere(
          `(
            order.expiresAt > NOW()
            OR (
              order.expiresAt IS NULL
              AND order.status IN (:...confirmedStatuses)
            )
          )`,
          {
            confirmedStatuses: [OrderStatus.PAID, OrderStatus.SENT],
          },
        )
        .getOne();

      if (!orderEntity) {
        throw new NotFoundException(
          `Order ${orderId} not found or not paid / sent`,
        );
      }

      // --------------------------------------------
      // 3. CANCELLED
      // --------------------------------------------

      orderEntity.status = OrderStatus.CANCELLEDFOREDIT;
      orderEntity.expiresAt = null;

      await queryRunner.manager.save(Order, orderEntity);

      // --------------------------------------------
      // 4. Actualizar las reservas a CANCELLED
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.CANCELLED })

        .where('orderId = :orderId', { orderId })
        .andWhere('status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING, ReservationStatus.PAID],
        })
        .andWhere('expiresAt > NOW()') //! condición de no expirada
        .execute();

      // --------------------------------------------
      // 5. Se eliminan las transacciones
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(Transaction)
        .set({ deletedAt: new Date() })
        .where('orderId = :orderId', { orderId })
        .execute();

      await queryRunner.commitTransaction();

      return orderEntity;
    } catch (error) {
      queryRunner.rollbackTransaction();
      handleDBExceptions(error);
      throw error; //! por typescript
    } finally {
      queryRunner.release();
    }
  }

  //? ============================================================================================== */
  //?                          Cancel_Order_Customer                                                 */
  //? ============================================================================================== */

  async cancelForCustomer(orderId: number, customer: Customer) {
    // --------------------------------------------
    // 1. Iniciar QueryRunner
    // --------------------------------------------

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 2. Obtener la orden generadas por el customer
      // --------------------------------------------

      const orderEntity = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .innerJoin('order.customer', 'customer')

        .where('order.id = :id', { id: orderId })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PENDING],
        })
        .andWhere('order.expiresAt > NOW()')
        .andWhere('customer.id = :customerId', { customerId: customer.id })
        .getOne();

      if (!orderEntity) {
        throw new NotFoundException(
          `Order ${orderId} not found or not pending`,
        );
      }

      // --------------------------------------------
      // 3. DeletedAt por PENDING
      // --------------------------------------------

      orderEntity.deletedAt = new Date();
      orderEntity.status = OrderStatus.CANCELLED;
      orderEntity.expiresAt = null;

      await queryRunner.manager.save(Order, orderEntity);

      // --------------------------------------------
      // 4. Actualizar las reservas a CANCELLED
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(StockReservation)
        .set({ status: ReservationStatus.CANCELLED })

        .where('orderId = :orderId', { orderId })
        .andWhere('status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING],
        })
        .andWhere('expiresAt > NOW()') //! condición de no expirada

        .execute();

      // --------------------------------------------
      // 5. Se eliminan las transacciones
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(Transaction)
        .set({ deletedAt: new Date() })
        .where('orderId = :orderId', { orderId })
        .execute();

      await queryRunner.commitTransaction();

      return orderEntity;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
      throw error; //! por typescript
    } finally {
      await queryRunner.release();
    }
  }
}
