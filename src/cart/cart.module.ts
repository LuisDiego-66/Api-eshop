import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

import { VariantsModule } from 'src/modules/variants/variants.module';

@Module({
  imports: [VariantsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
