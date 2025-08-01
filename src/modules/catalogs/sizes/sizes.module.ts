import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SizesController } from './sizes.controller';
import { SizesService } from './sizes.service';
import { Size } from './entities/size.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Size])],
  controllers: [SizesController],
  providers: [SizesService],
  exports: [TypeOrmModule, SizesService],
})
export class SizesModule {}
