import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Item } from './entities/item.entity';

import { StatusChangerCronJob } from './cronjobs/status-changer.cron';

import { VariantsModule } from '../variants/variants.module';
import { CustomersModule } from '../customers/customers.module';
import { StockReservationsModule } from '../stock-reservations/stock-reservations.module';

import { PricingService } from './pricing.service';
import { CreateOrder } from './services/create.service';
import { CancelOrder } from './services/cancel.service';
import { UpdateOrder } from './services/update.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Item]),
    VariantsModule,
    StockReservationsModule,
    CustomersModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PricingService,
    StatusChangerCronJob,
    CreateOrder,
    CancelOrder,
    UpdateOrder,
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
