import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';
import { Outfit } from './entities/outfit.entity';

import { VariantsModule } from '../variants/variants.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Outfit]), VariantsModule, ProductsModule],
  controllers: [OutfitsController],
  providers: [OutfitsService],
  exports: [TypeOrmModule, OutfitsService],
})
export class OutfitsModule {}
