import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VariantsModule } from '../variants/variants.module';

import { OutfitsController } from './outfits.controller';
import { OutfitsService } from './outfits.service';
import { Outfit } from './entities/outfit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Outfit]), VariantsModule],
  controllers: [OutfitsController],
  providers: [OutfitsService],
  exports: [TypeOrmModule, OutfitsService],
})
export class OutfitsModule {}
