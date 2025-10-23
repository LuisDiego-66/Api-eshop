import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from '../orders.service';

@Injectable()
export class StatusChangerCronJob {
  constructor(private readonly orderService: OrdersService) {}

  //@Cron('*/1 * * * *') // cada minuto
  async handleExpiration() {
    await this.orderService.expireOrders();
    console.log('\x1b[32m%s\x1b[0m', '✅ Expired orders handled.');
  }
}
