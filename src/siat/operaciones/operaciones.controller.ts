import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  CierrePuntoVentaDto,
  RegistroPuntoVentaDto,
  RegistroEventoSignificativoDto,
  ConsultaEventoSignificativoDto,
} from './dto';
import { QueryDto } from '../common/dto/query.dto';

import { PuntosVentaService } from './puntos-venta.service';
import { EventosSignificativosService } from './eventos-significativos.service';

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
    @Query() query: QueryDto,
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

  @Get('evento-significativo')
  async findAllEventos() {
    return this.eventosSignificativosService.findAll();
  }

  //? ============================================================================================== */
  //?                              Consulta_Eventos                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('evento-significativo/consulta')
  async consultaEventosSignificativos(
    @Query() query: QueryDto,
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
    @Query() query: QueryDto,
    @Body() dto: RegistroPuntoVentaDto,
  ) {
    return this.puntosVentaService.registroPuntoVenta(dto, query);
  }

  //? ============================================================================================== */
  //?                           FindAll_PuntosVenta                                                  */
  //? ============================================================================================== */

  @Get('evento-significativo')
  async findAllPuntosVenta() {
    return this.puntosVentaService.findAll();
  }

  //? ============================================================================================== */
  //?                          Consulta_PuntosVenta                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('punto-venta/consulta')
  async consultaPuntosVenta(@Query() query: QueryDto) {
    return this.puntosVentaService.consultaPuntoVenta(query);
  }

  //? ============================================================================================== */
  //?                             Cierre_PuntoVenta                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('punto-venta/cierre')
  async cierrePuntosVenta(
    @Query() query: QueryDto,
    @Body() cierrePuntoVentaDto: CierrePuntoVentaDto,
  ) {
    return this.puntosVentaService.cierrePuntoVenta(cierrePuntoVentaDto, query);
  }
}
