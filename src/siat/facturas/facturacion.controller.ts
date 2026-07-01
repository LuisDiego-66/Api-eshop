import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  CreateFacturaDto,
  AnulacionFacturaDto,
  ValidacionPaqueteFacturaDto,
  VerificacionEstadoFacturaDto,
  ReversionAnulacionFacturaDto,
} from './dto';

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
  @Post('facturacion/contingencia')
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

  /* @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/offline/lote')
  async facturacionOfflineLote(
    @Query() query: QueryDto,
    @Body() dto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOfflineLote(dto, query);
  } */

  //? ============================================================================================== */
  //?                     Verificacion_Estado_Factura                                                */
  //? ============================================================================================== */

  @Post('facturacion/verificacion')
  async verificacionEstadoFactura(@Body() dto: VerificacionEstadoFacturaDto) {
    return this.facturacionService.verificacionEstadoFactura(dto);
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

  /* @Post('facturacion/send-email')
  async sendFacturaEmail(@Body() dto: SendFacturaEmailDto) {
    return this.facturacionService.sendFacturaEmail(dto);
  } */

  //? ============================================================================================== */
  //?                          Enviar_Email_Anulacion                                                */
  //? ============================================================================================== */

  /* @Post('facturacion/send-email/anulacion')
  async sendAnulacionEmail(@Body() dto: SendAnulacionEmailDto) {
    return this.facturacionService.sendAnulacionEmail(dto);
  } */

  //? ============================================================================================== */
  //?                          Enviar_Email_Reversion                                                */
  //? ============================================================================================== */

  /* @Post('facturacion/send-email/reversion')
  async sendReversionEmail(@Body() dto: SendReversionEmailDto) {
    return this.facturacionService.sendReversionEmail(dto);
  } */

  //? ============================================================================================== */
  //?                           Enviar_Email_Paquete                                                 */
  //? ============================================================================================== */

  /* @Post('paquetes/send-email')
  async sendPaqueteEmail(@Body() dto: SendPaqueteEmailDto) {
    return this.facturacionService.sendPaqueteEmail(dto);
  } */

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
