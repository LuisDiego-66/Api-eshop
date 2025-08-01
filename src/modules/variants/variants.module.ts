import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { Variant } from './entities/variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Variant])],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [TypeOrmModule, VariantsService],
})
export class VariantsModule {}
