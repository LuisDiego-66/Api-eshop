import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ICartPayload } from '../../cart/interfaces/cart-payload.interface';

import { VariantsService } from 'src/modules/variants/variants.service';

@Injectable()
export class PricingService {
  constructor(
    private jwtService: JwtService,
    private readonly variantsService: VariantsService,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async rePrice(token: string) {
    // --------------------------------------------
    // 1. Validar y decodificar el token
    // --------------------------------------------

    const payload = await this.validateJwtToken(token);
    const cart = payload.cart;

    // --------------------------------------------
    // 2. Recalcular precios y descuentos
    // --------------------------------------------

    //! errors
    let errorsStock: Number[] = [];

    const cartRepriced = await Promise.all(
      cart.map(async (item) => {
        // --------------------------------------------
        // 3. Obtener la variante del producto
        // --------------------------------------------

        const variant = await this.variantsService.findOneVariant(
          item.variantId,
        );

        // --------------------------------------------
        // 4. Calcular precio unitario, descuento y total
        // --------------------------------------------

        const unit_price = Number(variant.productColor.product.price);

        // --------------------------------------------
        // 5. Verificar descuento activo y válido
        // --------------------------------------------

        let discountValue = 0;
        const discount = variant.productColor.product.discount;
        if (discount && discount.isActive) {
          const now = new Date();
          const isValid =
            (!discount.startDate || discount.startDate <= now) &&
            (!discount.endDate || discount.endDate >= now);

          if (isValid) {
            discountValue = discount.value || 0;
          }
        }

        // --------------------------------------------
        // 6. Verificar stock disponible
        // --------------------------------------------

        //! errors
        const available = await this.variantsService.getAvailableStock(
          item.variantId,
        );
        if (available < item.quantity) errorsStock.push(item.variantId);

        // --------------------------------------------
        // 7. Calcular subtotal, descuento y total
        // --------------------------------------------

        const subtotal = unit_price * item.quantity;
        const discountAmount = (subtotal * discountValue) / 100;

        // --------------------------------------------
        // 8. Se aplica redondeo al total
        // --------------------------------------------

        let total = subtotal - discountAmount;
        const decimals = total - Math.floor(total);

        if (decimals >= 0.5) {
          total = Math.ceil(total);
        } else {
          total = Math.floor(total);
        }
        const totalPrice = total.toFixed(2);

        // --------------------------------------------
        // 8. Retornar el item revaluado
        // --------------------------------------------

        return {
          variantId: variant.id,
          quantity: item.quantity,
          unit_price,
          discountValue,
          totalPrice,
        };
      }),
    );

    // --------------------------------------------
    // 9. Calcular el total del carrito
    // --------------------------------------------

    const total = cartRepriced.reduce(
      (acc, item) => acc + Number(item.totalPrice),
      0,
    );

    if (errorsStock.length > 0) {
      throw new BadRequestException(
        `Insufficient stock for variants: [${errorsStock}]`,
      );
    }

    return {
      items: cartRepriced,
      total: total.toFixed(2),
      errorsStock,
    };
  }

  //* ============================================================================================== */
  //*                                        Functions                                               */
  //* ============================================================================================== */

  private async validateJwtToken(token: string): Promise<ICartPayload> {
    try {
      return await this.jwtService.verifyAsync<ICartPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
