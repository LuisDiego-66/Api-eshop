import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateDailyCashDto } from './dto';
import { DailyCash } from './entities/dailycash.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DailyCashService {
  constructor(
    @InjectRepository(DailyCash)
    private readonly dailyCashRepository: Repository<DailyCash>,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async create(createDailyCashDto: CreateDailyCashDto) {
    const dailyCash = this.dailyCashRepository.create(createDailyCashDto);
    return this.dailyCashRepository.save(dailyCash);
  }

  //? ============================================================================================== */
  //?                                       FindOne                                                  */
  //? ============================================================================================== */

  /* async findOne() {
    const now = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'America/La_Paz',
      }),
    );

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const dailyCash = await this.dailyCashRepository.findOne({
      where: {
        createdAt: Between(start, end),
      },
    });

    if (!dailyCash) {
      throw new NotFoundException('No daily cash record found for today');
    }

    return dailyCash;
  } */

  async findOne() {
    // --------------------------------------------
    // 1. Fecha actual en Bolivia
    // --------------------------------------------
    const nowBolivia = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'America/La_Paz',
      }),
    );

    // --------------------------------------------
    // 2. Inicio y fin del día en Bolivia
    // --------------------------------------------
    const startBolivia = new Date(nowBolivia);
    startBolivia.setHours(0, 0, 0, 0);

    const endBolivia = new Date(nowBolivia);
    endBolivia.setHours(23, 59, 59, 999);

    // --------------------------------------------
    // 3. Convertir a UTC (IMPORTANTE)
    // --------------------------------------------
    const startUTC = new Date(startBolivia.toISOString());
    const endUTC = new Date(endBolivia.toISOString());

    // --------------------------------------------
    // 4. Consulta
    // --------------------------------------------
    const dailyCash = await this.dailyCashRepository.findOne({
      where: {
        createdAt: Between(startUTC, endUTC),
      },
    });

    // --------------------------------------------
    // 5. Validación
    // --------------------------------------------
    if (!dailyCash) {
      throw new NotFoundException('No daily cash record found for today');
    }

    return dailyCash;
  }
}
