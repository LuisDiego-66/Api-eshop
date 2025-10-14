import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { CreateTransactionDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    private dataSource: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createTransactionDto: CreateTransactionDto) {
    const { variantId } = createTransactionDto;

    try {
      const newTransaction = this.transactionsRepository.create({
        ...createTransactionDto,
        variant: { id: variantId },
      });
      return await this.transactionsRepository.save(newTransaction);
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
