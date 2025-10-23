import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatusChangerCronJob } from './cronjobs/status-changer.cron';

import { StockReservationsController } from './stock-reservations.controller';
import { StockReservationsService } from './stock-reservations.service';
import { StockReservation } from './entities/stock-reservation.entity';
import { VariantsModule } from '../variants/variants.module';

@Module({
  imports: [TypeOrmModule.forFeature([StockReservation]), VariantsModule],
  controllers: [StockReservationsController],
  providers: [StockReservationsService, StatusChangerCronJob],
  exports: [StockReservationsService],
})
export class StockReservationsModule {}
