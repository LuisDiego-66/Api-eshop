import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SizesModule } from '../sizes/sizes.module';
import { FilesModule } from '../../files/files.module';

import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

import { ProductColor } from './entities/product-color.entity';
import { Transaction } from './entities/transaction.entity';
import { Variant } from './entities/variant.entity';
import { ColorsModule } from '../colors/colors.module';
import { TransactionsService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Variant, Transaction, ProductColor]),
    FilesModule,
    SizesModule,
    ColorsModule,
  ],
  controllers: [VariantsController],
  providers: [VariantsService, TransactionsService],
  exports: [TypeOrmModule, VariantsService],
})
export class VariantsModule {}
