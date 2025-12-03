import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateSliderDto, UpdateSliderDto } from './dto';

import { Slider } from './entities/slider.entity';

@Injectable()
export class SlidersService {
  constructor(
    @InjectRepository(Slider)
    private readonly sliderRepository: Repository<Slider>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createSliderDto: CreateSliderDto) {
    try {
      const newSlider = this.sliderRepository.create(createSliderDto);
      return await this.sliderRepository.save(newSlider);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll() {
    return await this.sliderRepository.find();
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const slider = await this.sliderRepository.findOneBy({ id });

    if (!slider) throw new NotFoundException('Slider not found');
    return slider;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateSliderDto: UpdateSliderDto) {
    const slider = await this.findOne(id);

    try {
      Object.assign(slider, updateSliderDto);
      return await this.sliderRepository.save(slider);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const slider = await this.findOne(id);

    try {
      await this.sliderRepository.softRemove(slider);

      return {
        message: 'Slider deleted successfully',
        deleted: slider,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
