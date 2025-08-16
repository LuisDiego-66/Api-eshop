import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { InternationalShipment } from './entities/international-shipment.entity';
import { NationalShipment } from './entities/national-shipment.entity';
//? ---------------------------------------------------------------------------------------------- */
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipment,
      NationalShipment,
      InternationalShipment,
    ]),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
