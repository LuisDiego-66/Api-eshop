import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockReservationsService } from '../stock-reservations.service';

@Injectable()
export class StatusChangerCronJob {
  constructor(private readonly stockService: StockReservationsService) {}

  //@Cron('*/1 * * * *')
  async handleExpiration() {
    await this.stockService.expireReservations();
  }
}
