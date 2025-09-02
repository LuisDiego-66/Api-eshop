import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';
import { envs } from './config/environments/environments';

import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { CartModule } from './cart/cart.module';

import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubcategoriesModule } from './modules/subcategories/subcategories.module';
import { DiscountsModule } from './modules/discounts/discounts.module';

import { ProductsModule } from './modules/products/products.module';
import { BrandsModule } from './modules/catalogs/brands/brands.module';
import { ColorsModule } from './modules/catalogs/colors/colors.module';
import { SizesModule } from './modules/catalogs/sizes/sizes.module';

import { VariantsModule } from './modules/variants/variants.module';
import { OutfitsModule } from './modules/outfits/outfits.module';
import { OrdersModule } from './modules/orders/orders.module';

import { CustomersModule } from './modules/customers/customers.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';

import { StockReservationsModule } from './modules/stock-reservations/stock-reservations.module';

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
      synchronize: true, //! dev mode
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to the static files
    }),

    AuthModule,
    UsersModule,
    CustomersModule,
    CategoriesModule,
    SubcategoriesModule,
    DiscountsModule,
    BrandsModule,
    ProductsModule,
    ColorsModule,
    SizesModule,
    VariantsModule,
    OutfitsModule,
    OrdersModule,
    ShipmentsModule,
    AddressesModule,
    MailModule,
    CartModule,
    StockReservationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
