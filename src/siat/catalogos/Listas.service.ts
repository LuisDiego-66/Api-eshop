import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SoapClient } from '../soap/soap.client';

import { ListasDto } from './dto/listas.dto';
import { QueryDto } from '../common/dto/query.dto';

import { SincronizacionService } from './services/sincronizacion.service';

import { SiatSync } from './entities/siat_sync.entity';

@Injectable()
export class ListasService {
  private readonly client: SoapClient;

  constructor(
    @InjectRepository(SiatSync)
    private readonly siatSyncRepository: Repository<SiatSync>,

    private readonly sincronizacionService: SincronizacionService,
  ) {}

  //? ============================================================================================== */
  //?                                     Get_Lista                                                  */
  //? ============================================================================================== */

  async getLista(dto: ListasDto, query: QueryDto) {
    const siatSync = await this.sincronizacionService.sincronizacion(query);

    const lista = await this.siatSyncRepository.findOne({
      where: {
        id: siatSync.id,
        listas: { methodName: dto.metodo },
      },
      relations: { listas: true },
    });

    return lista;
  }
}
