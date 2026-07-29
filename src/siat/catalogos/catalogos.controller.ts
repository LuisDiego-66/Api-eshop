import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { ListasDto } from './dto/listas.dto';
import { ParametricasDto } from './dto/parametricas.dto';
import { SettingsDto } from '../common/dto/settings.dto';

import { ListasService } from './Listas.service';
import { FechaHoraService } from './fecha-hora.service';
import { ParametricasService } from './parametricas.service';
import { SincronizacionService } from './services/sincronizacion.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('SIAT: Catalogos')
@Controller('catalogos')
export class CatalogosController {
  constructor(
    private readonly sincronizacionService: SincronizacionService,
    private readonly parametricasService: ParametricasService,
    private readonly listasService: ListasService,
    private readonly fechaHoraService: FechaHoraService,
  ) {}

  //? ============================================================================================== */
  //?                                Sincronizacion                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('sincronizacion')
  sincronizacion(@Query() sincronizacionDto: SettingsDto) {
    return this.sincronizacionService.sincronizacion(sincronizacionDto);
  }

  //? ============================================================================================== */
  //?                                  Parametricas                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('parametricas')
  getParametricas(
    @Query() query: SettingsDto,
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
  getListas(@Query() query: SettingsDto, @Body() listasDto: ListasDto) {
    return this.listasService.getLista(listasDto, query);
  }

  //? ============================================================================================== */
  //?                                  Fecha_Y_Hora                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('fecha-hora')
  getFechaHora(@Query() query: SettingsDto) {
    return this.fechaHoraService.getFechaHora(query);
  }
}
