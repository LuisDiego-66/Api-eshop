import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { ReservationStatus } from './enum/reservation-status.enum';

import { VariantsService } from '../variants/variants.service';

import { StockReservation } from './entities/stock-reservation.entity';

@Injectable()
export class StockReservationsService {
  constructor(
    @InjectRepository(StockReservation)
    private readonly reservationRepository: Repository<StockReservation>,
    private variantsServices: VariantsService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createReservation(
    manager: EntityManager,
    variantId: number,
    orderId: number,
    quantity: number,
  ) {
    const available = await this.variantsServices.getAvailableStock(variantId);
    if (available < quantity)
      throw new BadRequestException(
        `Insufficient stock for variant ${variantId}`,
      );
    try {
      const reservation = manager.create(StockReservation, {
        variant: { id: variantId },
        order: { id: orderId },
        quantity,
      });
      await manager.save(reservation);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       Expired                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async expireReservations() {
    await this.reservationRepository.update(
      { status: ReservationStatus.PENDING, expiresAt: LessThan(new Date()) },
      { status: ReservationStatus.EXPIRED },
    );
  }
}
