import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Item } from './entities/Item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Item])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
