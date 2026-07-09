import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Item } from './entities/item.entity';

import { StatusChangerCronJob } from './cronjobs/status-changer.cron';

import { ExelModule } from 'src/exel/exel.module';
import { VariantsModule } from '../variants/variants.module';
import { CustomersModule } from '../customers/customers.module';
import { StockReservationsModule } from '../stock-reservations/stock-reservations.module';

import { PricingService } from './pricing.service';
import { CreateService } from './services/create.service';
import { CancelService } from './services/cancel.service';
import { UpdateService } from './services/update.service';
import { ConfirmService } from './services/confirm.service';

import { DailyCash } from './entities/dailycash.entity';
import { DailyCashService } from './daily-cash.service';
import { DailyCashController } from './daily-cash.controller';

import { BillingModule } from '../billings/billing.module';
import { SiatModule } from 'src/siat/siat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Item, DailyCash]),

    forwardRef(() => VariantsModule),

    StockReservationsModule,
    forwardRef(() => CustomersModule),
    ExelModule,
    BillingModule,
    forwardRef(() => SiatModule),
  ],
  controllers: [OrdersController, DailyCashController],
  providers: [
    OrdersService,
    PricingService,
    StatusChangerCronJob,
    CreateService,
    CancelService,
    UpdateService,
    ConfirmService,
    DailyCashService,
  ],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
