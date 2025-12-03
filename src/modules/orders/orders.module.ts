import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Item } from './entities/item.entity';

import { StatusChangerCronJob } from './cronjobs/status-changer.cron';

import { StockReservationsModule } from '../stock-reservations/stock-reservations.module';
import { VariantsModule } from '../variants/variants.module';

import { CreateOrder } from './services/create.service';
import { PricingService } from './pricing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Item]),
    VariantsModule,
    StockReservationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PricingService, StatusChangerCronJob, CreateOrder],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
