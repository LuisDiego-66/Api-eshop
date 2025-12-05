import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateOrderInStoreDto, CreateOrderOnlineDto } from '../dto';

import { OrderType, PaymentType } from '../enums';

import { PricingService } from '../pricing.service';
import { VariantsService } from '../../variants/variants.service';
import { StockReservationsService } from '../../stock-reservations/stock-reservations.service';

import { Item } from '../entities/item.entity';
import { Order } from '../entities/order.entity';
import { Variant } from '../../variants/entities/variant.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Shipment } from 'src/modules/shipments/entities/shipment.entity';

@Injectable()
export class CreateOrder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pricingService: PricingService,
    private readonly variantsService: VariantsService,
    private readonly stockReservationsService: StockReservationsService,
  ) {}

  async createOrderBase(
    {
      dto,
      buyer,
      type,
      payment_type,
    }: {
      dto: CreateOrderInStoreDto | CreateOrderOnlineDto;
      buyer?: Customer;
      type: OrderType;
      payment_type: PaymentType;
    },

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
      const { items: token } = dto;
      const rePricing = await this.pricingService.rePrice(token);

      // --------------------------------------------
      // 1. Se crea la order Base
      // --------------------------------------------

      const orderData: Partial<Order> = {
        type,
        totalPrice: rePricing.total,
      };

      if (type === OrderType.ONLINE && buyer) {
        const { shipment, address } = dto as CreateOrderOnlineDto;

        // --------------------------------------------
        // 3. Se calcula el precio final Shipment + total
        // --------------------------------------------

        const shipmentEntity = await queryRunner.manager.findOne(Shipment, {
          where: { id: shipment },
        });
        if (!shipmentEntity)
          throw new NotFoundException(`Shipment ID ${shipment} not found`);

        orderData.shipment_price = Number(shipmentEntity.price);

        orderData.totalPrice = (
          Number(orderData.totalPrice) + orderData.shipment_price
        ).toFixed(2);

        Object.assign(orderData, {
          customer: { id: buyer.id },
          shipment: { id: shipment },
          address: { id: address },
        });
      }

      // --------------------------------------------
      // 2. Se agrega (QR, CASH, CARD)
      // --------------------------------------------

      const newOrder = queryRunner.manager.create(Order, {
        ...orderData,
        payment_type,
      });
      let order = await queryRunner.manager.save(newOrder);

      // --------------------------------------------
      // 4. Se crea los items y las reservas
      // --------------------------------------------

      for (const item of rePricing.items) {
        await this.handleItemCreationWithLock(queryRunner, order, item);
      }

      // --------------------------------------------
      // 5. Retornar la orden creada
      // --------------------------------------------

      if (!isExternal) await queryRunner.commitTransaction();

      return await queryRunner.manager.findOne(Order, {
        where: { id: newOrder.id },
        relations: {
          items: { variant: true },
          customer: true,
          shipment: true,
          address: true,
        },
      });
    } catch (error) {
      if (!isExternal) await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      if (!isExternal) await queryRunner.release();
    }
  }

  //? ============================================================================================== */

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
}
