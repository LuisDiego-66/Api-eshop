import { Injectable, NotFoundException } from '@nestjs/common';

import { DateTime } from 'luxon';

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
    // 1. Día Bolivia → convertido correctamente a UTC
    // --------------------------------------------
    const startUTC = DateTime.now()
      .setZone('America/La_Paz')
      .startOf('day')
      .toUTC()
      .toJSDate();

    const endUTC = DateTime.now()
      .setZone('America/La_Paz')
      .endOf('day')
      .toUTC()
      .toJSDate();

    // 🔍 DEBUG (muy importante ahora)
    /* console.log('startUTC:', startUTC);
    console.log('endUTC:', endUTC); */

    // --------------------------------------------
    // 2. Consulta
    // --------------------------------------------
    const dailyCash = await this.dailyCashRepository.findOne({
      where: {
        createdAt: Between(startUTC, endUTC),
      },
    });

    if (!dailyCash) {
      throw new NotFoundException('No daily cash record found for today');
    }

    return dailyCash;
  }
}
