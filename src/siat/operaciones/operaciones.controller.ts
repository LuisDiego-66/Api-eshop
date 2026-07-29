import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import {
  CierrePuntoVentaDto,
  RegistroPuntoVentaDto,
  RegistroEventoSignificativoDto,
  ConsultaEventoSignificativoDto,
} from './dto';
import { SettingsDto } from '../common/dto/settings.dto';

import { PuntosVentaService } from './puntos-venta.service';
import { EventosSignificativosService } from './eventos-significativos.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('SIAT: Operaciones')
@Controller('operaciones')
export class OperacionesController {
  constructor(
    private readonly eventosSignificativosService: EventosSignificativosService,
    private readonly puntosVentaService: PuntosVentaService,
  ) {}

  //? ============================================================================================== */
  //?                              Registro_Eventos                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('evento-significativo')
  async registroEventoSignificativo(
    @Query() query: SettingsDto,
    @Body() dto: RegistroEventoSignificativoDto,
  ) {
    return this.eventosSignificativosService.registroEventoSignificativo(
      dto,
      query,
    );
  }

  //? ============================================================================================== */
  //?                               FindAll_Eventos                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Get('evento-significativo')
  async findAllEventos(@Query() query: SettingsDto) {
    return this.eventosSignificativosService.findAll(query);
  }

  //? ============================================================================================== */
  //?                              Consulta_Eventos                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('evento-significativo/consulta')
  async consultaEventosSignificativos(
    @Query() query: SettingsDto,
    @Body() dto: ConsultaEventoSignificativoDto,
  ) {
    return this.eventosSignificativosService.consultaEventoSignificativo(
      dto,
      query,
    );
  }

  //? ============================================================================================== */
  //?                          Registro_PuntosVenta                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('punto-venta')
  async registropPuntoVenta(
    @Query() query: SettingsDto,
    @Body() dto: RegistroPuntoVentaDto,
  ) {
    return this.puntosVentaService.registroPuntoVenta(dto, query);
  }

  //? ============================================================================================== */
  //?                           FindAll_PuntosVenta                                                  */
  //? ============================================================================================== */

  @Get('punto-venta')
  async findAllPuntosVenta() {
    return this.puntosVentaService.findAll();
  }

  //? ============================================================================================== */
  //?                          Consulta_PuntosVenta                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('punto-venta/consulta')
  async consultaPuntosVenta(@Query() query: SettingsDto) {
    return this.puntosVentaService.consultaPuntoVenta(query);
  }

  //? ============================================================================================== */
  //?                             Cierre_PuntoVenta                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('punto-venta/cierre')
  async cierrePuntosVenta(
    @Query() query: SettingsDto,
    @Body() cierrePuntoVentaDto: CierrePuntoVentaDto,
  ) {
    return this.puntosVentaService.cierrePuntoVenta(cierrePuntoVentaDto, query);
  }
}
