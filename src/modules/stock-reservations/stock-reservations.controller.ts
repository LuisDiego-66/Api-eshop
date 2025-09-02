import { Controller } from '@nestjs/common';
import { StockReservationsService } from './stock-reservations.service';

@Controller('stock-reservations')
export class StockReservationsController {
  constructor(private readonly stockReservationsService: StockReservationsService) {}
}
