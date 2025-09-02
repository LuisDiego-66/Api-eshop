import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesModule } from '../../files/files.module';

import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { Variant } from './entities/variant.entity';
import { Income } from './entities/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Variant, Income]), FilesModule],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [TypeOrmModule, VariantsService],
})
export class VariantsModule {}
