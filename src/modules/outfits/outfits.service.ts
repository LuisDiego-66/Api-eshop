import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Outfit } from './entities/outfit.entity';
import { Variant } from '../variants/entities/variant.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateOutfitDto, UpdateOutfitDto } from './dto';

@Injectable()
export class OutfitsService {
  constructor(
    @InjectRepository(Outfit)
    private readonly outfitRepository: Repository<Outfit>,

    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createOutfitDto: CreateOutfitDto) {
    try {
      const variants = await this.variantRepository.findByIds(
        createOutfitDto.variantIds,
      );

      if (variants.length !== createOutfitDto.variantIds.length) {
        throw new NotFoundException('Some variant does not exist');
      }

      const outfit = this.outfitRepository.create({
        ...createOutfitDto,
        variants,
      });
      return await this.outfitRepository.save(outfit);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  findAll(pagination: PaginationDto) {
    return `This action returns all outfits`;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  findOne(id: number) {
    return `This action returns a #${id} outfit`;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  update(id: number, updateOutfitDto: UpdateOutfitDto) {
    return `This action updates a #${id} outfit`;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  remove(id: number) {
    return `This action removes a #${id} outfit`;
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

    throw new InternalServerErrorException(error.message);
  }
}
