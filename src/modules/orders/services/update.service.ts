import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateOrderInStoreDto } from '../dto';

import { OrderStatus, OrderType, PaymentType } from '../enums';

import { CreateService } from './create.service';
import { ConfirmService } from './confirm.service';

import { Order } from '../entities/order.entity';

@Injectable()
export class UpdateService {
  constructor(
    private readonly dataSource: DataSource,

    private readonly createService: CreateService,

    private readonly confirmService: ConfirmService,
  ) {}

  async update(orderId: number, items: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Se valida la orden
      // --------------------------------------------

      const orderOld = await queryRunner.manager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')

        .where('order.id = :id', { id: orderId })
        .andWhere('order.status IN (:...statuses)', {
          statuses: [OrderStatus.CANCELLEDFOREDIT],
        })
        .getOne();

      if (!orderOld) {
        throw new NotFoundException(
          `Order ${orderId} not found or not cancel for edit`,
        );
      }

      // --------------------------------------------
      // 2. Se crea una nueva orden
      // --------------------------------------------

      let newOrder: any;

      //* ------- IN_STORE -------
      if (orderOld.type === OrderType.IN_STORE) {
        newOrder = await this.createService.createOrderBase(
          {
            dto: { items } as CreateOrderInStoreDto,
            type: OrderType.IN_STORE,
            payment_type: PaymentType.CASH, //* Cash
          },
          orderOld.createdAt,
          queryRunner, //! queryRunner
        );
      }

      //* ------- ONLINE -------
      else if (
        orderOld.type === OrderType.ONLINE &&
        orderOld.address &&
        orderOld.customer &&
        orderOld.shipment
      ) {
        newOrder = await this.createService.createOrderBase(
          {
            dto: {
              items,
              address: orderOld.address.id,
              shipment: orderOld.shipment.id,
            },
            buyer: orderOld.customer,
            type: OrderType.ONLINE,
            payment_type: PaymentType.CASH, //* Cash
          },
          orderOld.createdAt,
          queryRunner, //! queryRunner
        );
      }

      // --------------------------------------------
      // 3. Se confirma la nueva orden
      // --------------------------------------------

      const orderConfirmed = await this.confirmService.confirmOrderForEdit(
        newOrder.id,
        queryRunner,
      );

      // --------------------------------------------
      // 3. Se guarda la nueva orden
      // --------------------------------------------
      orderOld.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(orderOld);

      await queryRunner.commitTransaction();

      return orderConfirmed;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }
}
