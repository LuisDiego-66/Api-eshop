import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/createCart.dto';

import { Auth } from 'src/auth/decorators';

@Auth()
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCarDto: CreateCartDto) {
    return this.cartService.createCart(createCarDto);
  }
}
