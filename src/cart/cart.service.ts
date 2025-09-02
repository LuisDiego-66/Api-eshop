import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateCartDto } from './dto/createCart.dto';
import { CreateItemDto } from 'src/modules/orders/dto';
import { ICartPayload } from './interfaces/cart-payload.interface';

import { VariantsService } from 'src/modules/variants/variants.service';

@Injectable()
export class CartService {
  constructor(
    private jwtService: JwtService,
    private readonly variantsService: VariantsService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createCart(dto: CreateCartDto) {
    let cart: CreateItemDto[] = [];

    //! se valida las variantes
    for (const item of dto.items) {
      await this.variantsService.findOne(item.variantId);
    }

    //! si existe token
    if (dto.token) {
      const payload = await this.validateJwtToken(dto.token);
      cart = payload.cart;

      //! se hace push de los nuevos items
      cart.push(...dto.items);
    } else {
      cart = dto.items;
    }

    //! se genera nuevo token con el carrito actualizado
    const newToken = this.generateJwt({ cart });
    return { cart, token: newToken };
  }
  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  private generateJwt(ICartpayload: ICartPayload) {
    return this.jwtService.sign(ICartpayload /* { expiresIn: '7d' } */);
  }

  private async validateJwtToken(token: string): Promise<ICartPayload> {
    try {
      return await this.jwtService.verifyAsync<ICartPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
