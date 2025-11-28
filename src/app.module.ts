import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
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
import { BrandsModule } from './modules/brands/brands.module';
import { ColorsModule } from './modules/colors/colors.module';
import { SizesModule } from './modules/sizes/sizes.module';

import { VariantsModule } from './modules/variants/variants.module';
import { OutfitsModule } from './modules/outfits/outfits.module';

import { OrdersModule } from './modules/orders/orders.module';
import { StockReservationsModule } from './modules/stock-reservations/stock-reservations.module';

import { CustomersModule } from './modules/customers/customers.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';

import { PaymentsModule } from './modules/payments/payments.module';
import { FilesModule } from './files/files.module';

import { PlacesModule } from './modules/places/places.module';
import { SlidersModule } from './modules/sliders/sliders.module';
import { AdvertisementsModule } from './modules/advertisements/advertisements.module';

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

    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    CustomersModule,
    CategoriesModule,
    SubcategoriesModule,
    DiscountsModule,
    BrandsModule,
    ColorsModule,
    ProductsModule,
    SizesModule,
    VariantsModule,
    OutfitsModule,
    OrdersModule,
    PlacesModule,
    ShipmentsModule,
    AddressesModule,
    MailModule,
    CartModule,
    FilesModule,
    StockReservationsModule,
    PaymentsModule,
    SlidersModule,
    AdvertisementsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
