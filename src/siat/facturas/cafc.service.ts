import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cafc } from './entities/cafc.entity';
import { CreateCafcDto } from './dto/create-cafc.dto';
import { UpdateCafcDto } from './dto/update-cafc.dto';

@Injectable()
export class CafcService {
  constructor(
    @InjectRepository(Cafc)
    private readonly cafcRepository: Repository<Cafc>,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async create(dto: CreateCafcDto) {
    if (dto.numeroInicial >= dto.numeroFinal) {
      throw new BadRequestException(
        'El número inicial debe ser menor al número final',
      );
    }

    const exists = await this.cafcRepository.findOne({
      where: { codigo: dto.codigo },
    });

    if (exists) {
      throw new BadRequestException('El CAFC ya existe');
    }

    const cafc = this.cafcRepository.create(dto);
    return await this.cafcRepository.save(cafc);
  }

  //? ============================================================================================== */
  //?                                       FindAll                                                  */
  //? ============================================================================================== */

  async findAll() {
    return await this.cafcRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const cafc = await this.cafcRepository.findOne({ where: { id } });

    if (!cafc) {
      throw new NotFoundException('CAFC no encontrado');
    }

    return cafc;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(id: number, dto: UpdateCafcDto) {
    const cafc = await this.findOne(id);

    Object.assign(cafc, dto);

    return await this.cafcRepository.save(cafc);
  }
}
