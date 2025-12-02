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

    // --------------------------------------------
    // 1. Validar variantes existentes
    // --------------------------------------------

    /* const variants =  */ await Promise.all(
      dto.items.map((item) =>
        this.variantsService.findOneVariant(item.variantId),
      ),
    );

    // --------------------------------------------
    // 2. Validar la existencia del token
    // --------------------------------------------

    if (dto.token) {
      const payload = await this.validateJwtToken(dto.token);

      // Recuperamos carrito previo
      cart = payload.cart;

      // --------------------------------------------
      // 3. Se agregan los nuevos items
      // --------------------------------------------

      cart.push(...dto.items);
    } else {
      cart = dto.items;
    }

    // --------------------------------------------
    // 4. Generar un nuevo token
    // --------------------------------------------

    const newToken = this.generateJwt({ cart });

    // --------------------------------------------
    // 5. Transformar carrito para respuesta enriquecida
    // --------------------------------------------

    const detailedCart = await Promise.all(
      cart.map(async (item) => {
        const variant = await this.variantsService.findOneVariant(
          item.variantId,
        );

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          variant,
        };
      }),
    );

    return { cart: detailedCart, token: newToken };
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
