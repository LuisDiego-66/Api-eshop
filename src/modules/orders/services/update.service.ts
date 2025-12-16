import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateOrderInStoreDto } from '../dto';

import { OrderType, PaymentType } from '../enums';

import { CreateService } from './create.service';
import { CancelService } from './cancel.service';

import { Order } from '../entities/order.entity';

@Injectable()
export class UpdateService {
  constructor(
    private readonly dataSource: DataSource,

    private readonly cancelService: CancelService,
    private readonly createService: CreateService,
  ) {}

  async update(orderId: number, items: string) {
    //! deshabilitar si es del dia

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --------------------------------------------
      // 1. Se cancela la orden
      // --------------------------------------------

      const orderCanceled: Order = await this.cancelService.cancel(
        orderId,
        queryRunner,
      );

      // --------------------------------------------
      // 2. Se crea una nueva orden
      // --------------------------------------------

      //! sin factura

      let newOrder: any;

      //* ------- IN_STORE -------
      if (orderCanceled.type === OrderType.IN_STORE) {
        newOrder = await this.createService.createOrderBase(
          {
            dto: { items } as CreateOrderInStoreDto,
            type: OrderType.IN_STORE,
            payment_type: PaymentType.CASH, //! Tipo de pago efectivo
          },
          orderCanceled.createdAt, //! Misma fecha de creacion
        );
      }

      //* ------- ONLINE -------
      else if (
        orderCanceled.type === OrderType.ONLINE &&
        orderCanceled.address &&
        orderCanceled.customer &&
        orderCanceled.shipment
      ) {
        newOrder = await this.createService.createOrderBase(
          {
            dto: {
              items,
              address: orderCanceled.address.id, //* los mismos datos de la orden eliminada
              shipment: orderCanceled.shipment.id, //* los mismos datos de la orden eliminada
            },
            buyer: orderCanceled.customer, //* los mismos datos de la orden eliminada
            type: OrderType.ONLINE,
            payment_type: PaymentType.CASH, //! Tipo de pago efectivo
          },
          orderCanceled.createdAt, //! Misma fecha de creacion
        );
      }

      // --------------------------------------------
      // 3. Se guarda la nueva orden
      // --------------------------------------------

      newOrder.edited = true;
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
