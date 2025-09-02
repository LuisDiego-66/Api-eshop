import { CreateItemDto } from 'src/modules/orders/dto';

export interface ICartPayload {
  cart: CreateItemDto[];
}
