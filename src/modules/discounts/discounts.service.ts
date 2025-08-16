import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Discount } from './entities/discount.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import {
  CreateSeasonalDiscountDto,
  CreatePermanentDiscountDto,
  UpdateSeasonalDiscountDto,
  UpdatePermanentDiscountDto,
} from './dto';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(
    createDiscountDto: CreateSeasonalDiscountDto | CreatePermanentDiscountDto,
  ) {
    try {
      const newDiscount = this.discountRepository.create(createDiscountDto);
      return await this.discountRepository.save(newDiscount);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;
    const discounts = await this.discountRepository.find({
      take: limit,
      skip: offset,
    });
    return discounts;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(
    id: number,
    updateDiscountDto: UpdateSeasonalDiscountDto | UpdatePermanentDiscountDto,
  ) {
    const discount = await this.findOne(id);
    try {
      Object.assign(discount, updateDiscountDto);
      return await this.discountRepository.save(discount);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const discount = await this.findOne(id);
    try {
      await this.discountRepository.softRemove(discount);
      return {
        message: 'Discount deleted successfully',
        deleted: discount,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    throw new InternalServerErrorException(error.message);
  }
}
