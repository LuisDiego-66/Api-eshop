import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  CreateSeasonalDiscountDto,
  CreatePermanentDiscountDto,
  UpdateSeasonalDiscountDto,
  UpdatePermanentDiscountDto,
} from './dto';

import { DiscountType } from './enums/discount-type.enum';

import { Discount } from './entities/discount.entity';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async create(
    createDiscountDto: CreateSeasonalDiscountDto | CreatePermanentDiscountDto,
  ) {
    try {
      const newDiscount = this.discountRepository.create(createDiscountDto);
      return await this.discountRepository.save(newDiscount);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  async findAll(pagination: PaginationDto) {
    const discounts = await this.discountRepository.find({});
    return discounts;
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  async findOne(id: number) {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(
    id: number,
    updateDiscountDto: UpdateSeasonalDiscountDto | UpdatePermanentDiscountDto,
  ) {
    const discount = await this.findOne(id);
    try {
      Object.assign(discount, updateDiscountDto);
      return await this.discountRepository.save(discount);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  async remove(id: number) {
    const discount = await this.findOne(id);
    try {
      await this.discountRepository.softRemove(discount);
      return {
        message: 'Discount deleted successfully',
        deleted: discount,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */

  async removePermanent() {
    const discounts = await this.discountRepository.find({
      where: { discountType: DiscountType.PERMANENT },
    });

    try {
      await this.discountRepository.softRemove(discounts);
      return {
        message: 'Discount deleted successfully',
        deleted: discounts,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */

  async removeSeasonal() {
    const discounts = await this.discountRepository.find({
      where: { discountType: DiscountType.SEASONAL },
    });

    try {
      await this.discountRepository.softRemove(discounts);
      return {
        message: 'Discount deleted successfully',
        deleted: discounts,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
