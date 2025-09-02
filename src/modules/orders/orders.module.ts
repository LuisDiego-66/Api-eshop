import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Item } from './entities/item.entity';

import { StockReservationsModule } from '../stock-reservations/stock-reservations.module';
import { VariantsModule } from '../variants/variants.module';

import { PricingService } from './pricing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Item]),
    VariantsModule,
    StockReservationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PricingService],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
