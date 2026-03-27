import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { ListasDto } from './dto/listas.dto';
import { ParametricasDto } from './dto/parametricas.dto';
import { QueryDto } from '../common/dto/query.dto';

import { ListasService } from './Listas.service';
import { ParametricasService } from './parametricas.service';
import { SincronizacionService } from './services/sincronizacion.service';

@ApiTags('SIAT: Catalogos')
@Controller('catalogos')
export class CatalogosController {
  constructor(
    private readonly sincronizacionService: SincronizacionService,
    private readonly parametricasService: ParametricasService,
    private readonly listasService: ListasService,
  ) {}

  //? ============================================================================================== */
  //?                                Sincronizacion                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('sincronizacion')
  sincronizacion(@Query() sincronizacionDto: QueryDto) {
    return this.sincronizacionService.sincronizacion(sincronizacionDto);
  }

  //? ============================================================================================== */
  //?                                  Parametricas                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('parametricas')
  getParametricas(
    @Query() query: QueryDto,
    @Body() parametricasDto: ParametricasDto,
  ) {
    return this.parametricasService.getParametrica(parametricasDto, query);
  }

  //? ============================================================================================== */
  //?                                        Listas                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('listas')
  getListas(@Query() query: QueryDto, @Body() listasDto: ListasDto) {
    return this.listasService.getLista(listasDto, query);
  }
}
