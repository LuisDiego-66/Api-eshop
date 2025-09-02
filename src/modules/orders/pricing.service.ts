import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ICartPayload } from '../../cart/interfaces/cart-payload.interface';
import { RepriceDto } from './dto';

import { VariantsService } from 'src/modules/variants/variants.service';

@Injectable()
export class PricingService {
  constructor(
    private jwtService: JwtService,
    private readonly variantsService: VariantsService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  /*   async rePrice(token: string) {
    //! Decodificar carrito desde el token
    const payload = await this.validateJwtToken(token);
    const cart = payload.cart;

    const cartRepriced: RepriceDto[] = [];
    let totalPrice = '';
    let total = 0;

    for (const item of cart) {
      //! Obtener variante con producto y descuento
      const variant = await this.variantsService.findOne(item.variantId);

      //! precio actual del producto
      const unit_price = Number(variant.product.price);

      //const discountValue = variant.product.discount?.value || 0;

      let discountValue = 0;
      //! Validar descuento (enabled + fechas)
      const discount = variant.product.discount;
      if (discount && discount.isActive) {
        const now = new Date();

        const isValid =
          (!discount.startDate || discount.startDate <= now) &&
          (!discount.endDate || discount.endDate >= now);

        if (isValid) {
          discountValue = discount.value || 0;
        }
      }

      //! stock disponible en este momento
      const available = await this.variantsService.getAvailableStock(
        item.variantId,
      );
      if (available < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${variant.id}`,
        );
      }

      //! Calcular subtotal con descuento
      const subtotal = unit_price * item.quantity;
      const discountAmount = (subtotal * discountValue) / 100;
      totalPrice = (subtotal - discountAmount).toFixed(2);

      //! Armar nuevo carrito
      cartRepriced.push({
        variantId: variant.id,
        quantity: item.quantity,
        unit_price,
        discountValue,
        totalPrice,
      });

      total += Number(totalPrice);
    }

    return {
      items: cartRepriced,
      total: total.toFixed(2),
    };
  }
 */

  async rePrice(token: string) {
    //! Decodificar carrito desde el token
    const payload = await this.validateJwtToken(token);
    const cart = payload.cart;

    //! Procesar en paralelo
    const cartRepriced = await Promise.all(
      cart.map(async (item) => {
        //! Obtener variante con producto y descuento
        const variant = await this.variantsService.findOne(item.variantId);

        //! Precio actual del producto
        const unit_price = Number(variant.product.price);

        //! Validar descuento (enabled + fechas)
        let discountValue = 0;
        const discount = variant.product.discount;
        if (discount && discount.isActive) {
          const now = new Date();
          const isValid =
            (!discount.startDate || discount.startDate <= now) &&
            (!discount.endDate || discount.endDate >= now);

          if (isValid) {
            discountValue = discount.value || 0;
          }
        }

        //! Stock disponible en este momento
        const available = await this.variantsService.getAvailableStock(
          item.variantId,
        );
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.id}`,
          );
        }

        //! Calcular subtotal con descuento
        const subtotal = unit_price * item.quantity;
        const discountAmount = (subtotal * discountValue) / 100;
        const totalPrice = (subtotal - discountAmount).toFixed(2);

        //! Armar nuevo carrito
        return {
          variantId: variant.id,
          quantity: item.quantity,
          unit_price,
          discountValue,
          totalPrice,
        };
      }),
    );

    //! Calcular total
    const total = cartRepriced.reduce(
      (acc, item) => acc + Number(item.totalPrice),
      0,
    );

    return {
      items: cartRepriced,
      total: total.toFixed(2),
    };
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  private async validateJwtToken(token: string): Promise<ICartPayload> {
    try {
      return await this.jwtService.verifyAsync<ICartPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
