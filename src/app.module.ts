import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/environments';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubcategoriesModule } from './modules/subcategories/subcategories.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { BrandsModule } from './modules/catalogs/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { ColorsModule } from './modules/catalogs/colors/colors.module';
import { SizesModule } from './modules/catalogs/sizes/sizes.module';
import { VariantsModule } from './modules/variants/variants.module';
import { MultimediaModule } from './modules/multimedia/multimedia.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AddressesModule } from './modules/addresses/addresses.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      database: envs.DB_NAME_DATABASE,
      username: envs.DB_USERNAME,
      password: envs.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true, //! dev mode only, never in production
    }),

    CategoriesModule,
    SubcategoriesModule,
    DiscountsModule,
    BrandsModule,
    ProductsModule,
    ColorsModule,
    SizesModule,
    VariantsModule,
    MultimediaModule,
    CustomersModule,
    ShipmentsModule,
    OrdersModule,
    AddressesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
