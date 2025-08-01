import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesService } from './subcategories.service';
import { Subcategory } from './entities/subcategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subcategory])],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
  exports: [TypeOrmModule, SubcategoriesService],
})
export class SubcategoriesModule {}
