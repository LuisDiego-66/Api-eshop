import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

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
