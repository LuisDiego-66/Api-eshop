import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

import { Search } from './entities/search.entity';

import { SearchsController } from './searchs.controller';
import { SearchsService } from './searchs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Search])],
  controllers: [ProductsController, SearchsController],
  providers: [ProductsService, SearchsService],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
