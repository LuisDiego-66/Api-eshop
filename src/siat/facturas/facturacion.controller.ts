import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import {
  CreateFacturaDto,
  AnulacionFacturaDto,
  VerificacionEstadoFacturaDto,
  ReversionAnulacionFacturaDto,
} from './dto';

import { SettingsDto, SettingsPaginationDto } from '../common/dto/settings.dto';
import { CreateFacturaContingenciaDto } from './dto/create-factura-contingencia.dto';

import { FacturacionService } from './facturacion.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('SIAT: Facturacion')
@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  //? ============================================================================================== */
  //?                           Verificar_Comunicacion                                               */
  //? ============================================================================================== */

  @Get('facturacion/verificar-comunicacion')
  async verificarComunicacion() {
    return this.facturacionService.verificarComunicacion();
  }

  //? ============================================================================================== */
  //?                            Facturacion_Online                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/online')
  async recepcionFacturaOnline(
    @Query() query: SettingsDto,
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
    @Query() query: SettingsDto,
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
    @Query() query: SettingsDto,
    @Body() dto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOffline(dto, query);
  }

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

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    type: String,
    description: 'Fecha inicio (filtro por fechaEmision). Si se envía sin fechaFin, filtra desde este día hasta la actualidad.',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    type: String,
    description: 'Fecha fin (filtro por fechaEmision)',
  })
  @Get('facturacion')
  async FindAllFacturas(@Query() query: SettingsPaginationDto) {
    return this.facturacionService.FindAll(query);
  }

  //? ============================================================================================== */
  //?                          Representacion_Grafica_Factura (PDF)                                  */
  //? ============================================================================================== */

  @ApiParam({ name: 'id', required: true, type: Number })
  @ApiProduces('application/pdf')
  @Get('facturacion/:id/representacion-grafica')
  async representacionGraficaFactura(
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    const { pdfBuffer, numeroFactura } =
      await this.facturacionService.getRepresentacionGrafica(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="factura-${numeroFactura}.pdf"`,
    );
    res.send(pdfBuffer);
  }
}
