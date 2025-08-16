import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Variant } from './entities/variant.entity';
import { Multimedia } from '../multimedia/entities/multimedia.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { MultimediaService } from '../multimedia/multimedia.service';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly multimediaService: MultimediaService,

    private readonly dataSourse: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createVariantDto: CreateVariantDto) {
    try {
      const { multimedia, ...data } = createVariantDto;

      const newVariant = this.variantRepository.create({
        ...data,
        product: { id: createVariantDto.product }, //! Is a number, not an object
        color: { id: createVariantDto.color },
        size: { id: createVariantDto.size },
        multimedia,
      });
      return await this.variantRepository.save(newVariant);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const variants = await this.variantRepository.find({
      take: limit,
      skip: offset,
      relations: { product: true, color: true, size: true, multimedia: true },
    });

    return variants;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: { product: true, color: true, size: true, multimedia: true },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return variant;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateVariantDto: UpdateVariantDto) {
    const { multimedia } = updateVariantDto;
    const variantEntity = await this.findOne(id);

    //const oldMultimedia = [...variantEntity.multimedia];

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (multimedia) {
        await queryRunner.manager.delete(Multimedia, {
          variant: { id: id },
        });

        //! se borran físicamente los archivos
        //await this.multimediaService.deletedFiles(oldMultimedia);
      }

      Object.assign(variantEntity, updateVariantDto);
      const variant = await queryRunner.manager.save(variantEntity);

      await queryRunner.commitTransaction();

      return variant;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const variant = await this.findOne(id);
    const { multimedia } = variant;

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (multimedia) {
        await queryRunner.manager.delete(Multimedia, {
          variant: { id: id },
        });

        //! se borran físicamente los archivos
        //await this.multimediaService.deletedFiles(multimedia);
      }

      await queryRunner.manager.softRemove(variant);
      await queryRunner.commitTransaction();

      return {
        message: 'Variant deleted successfully',
        deleted: variant, //! devuelve sin multimedias
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

    throw new InternalServerErrorException(error.message);
  }
}
