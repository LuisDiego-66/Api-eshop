import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto';

import { Advertisement } from './entities/advertisement.entity';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createAdvertisementDto: CreateAdvertisementDto) {
    try {
      const newAdvertisement = this.advertisementRepository.create(
        createAdvertisementDto,
      );
      return await this.advertisementRepository.save(newAdvertisement);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       FindAll                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll() {
    const advertisements = await this.advertisementRepository.find();
    return advertisements;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       FindOne                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const advertisement = await this.advertisementRepository.findOne({
      where: { id },
    });
    if (!advertisement) {
      throw new NotFoundException('Advertisement not found');
    }
    return advertisement;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateAdvertisementDto: UpdateAdvertisementDto) {
    const advertisement = await this.findOne(id);
    try {
      Object.assign(advertisement, updateAdvertisementDto);
      return await this.advertisementRepository.save(advertisement);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const advertisement = await this.findOne(id);
    try {
      await this.advertisementRepository.softRemove(advertisement);
      return {
        message: 'Advertisement deleted successfully',
        deleted: advertisement,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
