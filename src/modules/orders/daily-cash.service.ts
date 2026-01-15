import { Injectable } from '@nestjs/common';

import { CreateDailyCashDto } from './dto';
import { DailyCash } from './entities/dailycash.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DailyCashService {
  constructor(
    @InjectRepository(DailyCash)
    private readonly dailyCashRepository: Repository<DailyCash>,
  ) {}

  async create(createDailyCashDto: CreateDailyCashDto) {
    const dailyCash = this.dailyCashRepository.create(createDailyCashDto);
    return this.dailyCashRepository.save(dailyCash);
  }
}
