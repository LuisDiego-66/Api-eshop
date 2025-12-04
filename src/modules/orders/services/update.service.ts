import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateOrderInStoreDto } from '../dto';

import { OrderType } from '../enums';

import { CreateOrder } from './create.service';
import { CancelOrder } from './cancel.service';

@Injectable()
export class UpdateOrder {
  constructor(
    private readonly dataSource: DataSource,

    private readonly cancelOrder: CancelOrder,
    private readonly createOrder: CreateOrder,
  ) {}

  async update(orderId: number, items: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Se cancela la orden
      // --------------------------------------------

      const orderCanceled = await this.cancelOrder.cancel(orderId, queryRunner);

      // --------------------------------------------
      // 2. Se crea una nueva orden
      // --------------------------------------------

      let newOrder: any;

      //* ------- IN_STORE -------
      if (orderCanceled.type === OrderType.IN_STORE) {
        newOrder = await this.createOrder.createOrderBase({
          dto: { items } as CreateOrderInStoreDto,
          type: OrderType.IN_STORE,
          payment_type: orderCanceled.payment_type,
        });
      }

      //* ------- ONLINE -------
      else if (
        orderCanceled.type === OrderType.ONLINE &&
        orderCanceled.address &&
        orderCanceled.customer &&
        orderCanceled.shipment
      ) {
        newOrder = await this.createOrder.createOrderBase({
          dto: {
            items,
            address: orderCanceled.address.id, //* los mismos datos de la orden eliminada
            shipment: orderCanceled.shipment.id, //* los mismos datos de la orden eliminada
          },
          buyer: orderCanceled.customer, //* los mismos datos de la orden eliminada
          type: OrderType.ONLINE,
          payment_type: orderCanceled.payment_type,
        });
      }

      // --------------------------------------------
      // 3. Se guarda la nueva orden
      // --------------------------------------------

      await queryRunner.manager.save(newOrder);
      await queryRunner.commitTransaction();

      return newOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }
}
