import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  CreateFacturaDto,
  AnulacionFacturaDto,
  VerificacionEstadoFacturaDto,
  ValidacionPaqueteFacturaDto,
  ReversionAnulacionFacturaDto,
} from './dto';
import { SendFacturaEmailDto } from './dto/send-factura-email.dto';
import { QueryDto } from '../common/dto/query.dto';
import { CreatePaqueteContingenciaDto } from './dto/create-paquete-contingencia.dto';
import { CreateFacturaContingenciaDto } from './dto/create-factura-contingencia.dto';

import { PaquetesService } from './paquetes.service';
import { FacturacionService } from './facturacion.service';

@ApiTags('SIAT: Facturacion')
@Controller('facturacion')
export class FacturacionController {
  constructor(
    private readonly facturacionService: FacturacionService,
    private readonly paquetesService: PaquetesService,
  ) {}

  //? ============================================================================================== */
  //?                            Facturacion_Online                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/online')
  async recepcionFacturaOnline(
    @Query() query: QueryDto,
    @Body() dto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOnline(dto, query);
  }

  //? ============================================================================================== */
  //?               Facturacion_Offline_Contingencia                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/online/contingencia')
  async recepcionFacturaOnlineContingencia(
    @Query() query: QueryDto,
    @Body() dto: CreateFacturaContingenciaDto,
  ) {
    return this.facturacionService.facturacionOfflineContingencia(dto, query);
  }

  //? ============================================================================================== */
  //?                           Facturacion_Offline                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/offline')
  async recepcionFacturaOffline(
    @Query() query: QueryDto,
    @Body() dto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOffline(dto, query);
  }

  //? ============================================================================================== */
  //?                      Facturacion_Offline_Lote                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/offline/lote')
  async facturacionOfflineLote(
    @Query() query: QueryDto,
    @Body() dto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOfflineLote(dto, query);
  }

  //? ============================================================================================== */
  //?                     Verificacion_Estado_Factura                                                */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/verificacion')
  async verificacionEstadoFactura(
    @Query() query: QueryDto,
    @Body() dto: VerificacionEstadoFacturaDto,
  ) {
    return this.facturacionService.verificacionEstadoFactura(dto, query);
  }

  //? ============================================================================================== */
  //?                               Anulacion_Factura                                                */
  //? ============================================================================================== */

  @Post('facturacion/anulacion')
  async anulacionFactura(@Body() dto: AnulacionFacturaDto) {
    return this.facturacionService.anulacionFactura(dto);
  }

  //? ============================================================================================== */
  //?                   Reversion_Anulacion_Factura                                                  */
  //? ============================================================================================== */

  @Post('facturacion/reversion')
  async reversionAnulacionFactura(@Body() dto: ReversionAnulacionFacturaDto) {
    return this.facturacionService.reversionAnulacionFactura(dto);
  }

  //? ============================================================================================== */
  //?                              FindAll_Facturas                                                  */
  //? ============================================================================================== */

  @Get('facturacion')
  async FindAllFacturas() {
    return this.facturacionService.FindAll();
  }

  //? ============================================================================================== */
  //?                             Enviar_Email_Factura                                               */
  //? ============================================================================================== */

  @Post('facturacion/send-email')
  async sendFacturaEmail(@Body() dto: SendFacturaEmailDto) {
    return this.facturacionService.sendFacturaEmail(dto);
  }

  //? ============================================================================================== */
  //?                                Enviar_Paquete                                                  */
  //? ============================================================================================== */

  @Post('paquetes')
  async recepcionPaqueteFacturas() {
    return this.paquetesService.recepcionPaqueteFactura();
  }

  //? ============================================================================================== */
  //?                   Enviar_Paquete_Contingencia                                                  */
  //? ============================================================================================== */

  @Post('paquetes/contingencia')
  async recepcionPaqueteFacturasContingencia(
    @Body() dto: CreatePaqueteContingenciaDto,
  ) {
    return this.paquetesService.recepcionPaqueteFacturaContingencia(dto);
  }

  //? ============================================================================================== */
  //?                            Validacion_Paquete                                                  */
  //? ============================================================================================== */

  @Post('paquetes/validacion')
  async validacionPaqueteFacturas(
    @Body() validacionPaqueteFacturaDto: ValidacionPaqueteFacturaDto,
  ) {
    return this.paquetesService.validacionPaqueteFactura(
      validacionPaqueteFacturaDto,
    );
  }
}
