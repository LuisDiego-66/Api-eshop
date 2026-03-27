import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SoapClient } from '../soap/soap.client';

import { QueryDto } from '../common/dto/query.dto';
import { ParametricasDto } from './dto/parametricas.dto';

import { SincronizacionService } from './services/sincronizacion.service';

import { SiatSync } from './entities/siat_sync.entity';

@Injectable()
export class ParametricasService {
  private readonly client: SoapClient;

  constructor(
    @InjectRepository(SiatSync)
    private readonly siatSyncRepository: Repository<SiatSync>,

    private readonly sincronizacionService: SincronizacionService,
  ) {}

  //? ============================================================================================== */
  //?                               Get_Parametrica                                                  */
  //? ============================================================================================== */

  async getParametrica(dto: ParametricasDto, query: QueryDto) {
    const siatSync = await this.sincronizacionService.sincronizacion(query);

    const parametrica = await this.siatSyncRepository.findOne({
      where: {
        id: siatSync.id,
        parametrica: { methodName: dto.metodo },
      },
      relations: { parametrica: true },
    });

    return parametrica;
  }
}
