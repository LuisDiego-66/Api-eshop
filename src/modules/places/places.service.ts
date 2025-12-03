import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreatePlaceDto, UpdatePlaceDto } from './dto';

import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createPlaceDto: CreatePlaceDto) {
    try {
      const { shipments, ...data } = createPlaceDto;

      const newPlace = this.placeRepository.create({
        ...data,
        shipments,
      });

      return await this.placeRepository.save(newPlace);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll() {
    return await this.placeRepository.find({ relations: { shipments: true } });
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const place = await this.placeRepository.findOne({
      where: { id },
      relations: { shipments: true },
    });
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updatePlaceDto: UpdatePlaceDto) {
    const place = await this.findOne(id);

    try {
      Object.assign(place, updatePlaceDto);
      return await this.placeRepository.save(place);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const place = await this.findOne(id);
    try {
      await this.placeRepository.softRemove(place);
      return {
        message: 'Place deleted successfully',
        deleted: place,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
