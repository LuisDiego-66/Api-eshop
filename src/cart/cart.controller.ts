import { Body, Controller, Post } from '@nestjs/common';

import { CreateCartDto } from './dto/createCart.dto';

import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCarDto: CreateCartDto) {
    return this.cartService.createCart(createCarDto);
  }
}
