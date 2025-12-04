import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AddStockDto, SubtractStockDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    private dataSource: DataSource,
  ) {}

  //? ============================================================================================== */
  //?                                     Add_Stock                                                  */
  //? ============================================================================================== */

  async addStock(addStockDto: AddStockDto) {
    const { variantId } = addStockDto;

    try {
      const newTransaction = this.transactionsRepository.create({
        ...addStockDto,
        variant: { id: variantId },
      });
      return await this.transactionsRepository.save(newTransaction);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                Subtract_Stock                                                  */
  //? ============================================================================================== */

  async SubtractStock(subtractStockDto: SubtractStockDto) {
    const { variantId } = subtractStockDto;

    try {
      const newTransaction = this.transactionsRepository.create({
        ...subtractStockDto,
        variant: { id: variantId },
      });
      return await this.transactionsRepository.save(newTransaction);
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
