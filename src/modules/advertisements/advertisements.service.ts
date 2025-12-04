import { Injectable } from '@nestjs/common';
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

  async findOne() {
    const advertisements = await this.advertisementRepository.find();
    return advertisements[0];
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(updateAdvertisementDto: UpdateAdvertisementDto) {
    const advertisement = await this.findOne();

    try {
      Object.assign(advertisement, updateAdvertisementDto);
      return await this.advertisementRepository.save(advertisement);
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
