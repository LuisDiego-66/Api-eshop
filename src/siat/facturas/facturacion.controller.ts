import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  CreatePaqueteDto,
  CreateFacturaDto,
  VerificacionEstadoFacturaDto,
  ValidacionPaqueteFacturaDto,
  AnulacionFacturaDto,
  ReversionAnulacionFacturaDto,
} from './dto';
import { QueryDto } from '../common/dto/query.dto';

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
    @Body() createfacturaDto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOnline(createfacturaDto, query);
  }

  //? ============================================================================================== */
  //?                           Facturacion_Offline                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/offline')
  async recepcionFacturaOffline(
    @Query() query: QueryDto,
    @Body() createfacturaDto: CreateFacturaDto,
  ) {
    return this.facturacionService.facturacionOffline(createfacturaDto, query);
  }

  //? ============================================================================================== */
  //?                     Verificacion_Estado_Factura                                                */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/verificacion')
  async verificacionEstadoFactura(
    @Query() query: QueryDto,
    @Body() verificacionfacturaDto: VerificacionEstadoFacturaDto,
  ) {
    return this.facturacionService.verificacionEstadoFactura(
      verificacionfacturaDto,
      query,
    );
  }

  //? ============================================================================================== */
  //?                               Anulacion_Factura                                                */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/anulacion')
  async anulacionFactura(
    @Query() query: QueryDto,
    @Body() anulacionfacturaDto: AnulacionFacturaDto,
  ) {
    return this.facturacionService.anulacionFactura(anulacionfacturaDto, query);
  }

  //? ============================================================================================== */
  //?                   Reversion_Anulacion_Factura                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('facturacion/reversion')
  async reversionAnulacionFactura(
    @Query() query: QueryDto,
    @Body() reversionAnulacionFacturaDto: ReversionAnulacionFacturaDto,
  ) {
    return this.facturacionService.reversionAnulacionFactura(
      reversionAnulacionFacturaDto,
      query,
    );
  }

  //? ============================================================================================== */
  //?                              FindAll_Facturas                                                  */
  //? ============================================================================================== */

  @Get('facturacion')
  async FindAllFacturas() {
    return this.facturacionService.FindAll();
  }

  //? ============================================================================================== */
  //?                                Enviar_Paquete                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('paquetes')
  async recepcionPaqueteFacturas(
    @Query() query: QueryDto,
    @Body() createPaqueteDto: CreatePaqueteDto,
  ) {
    return this.paquetesService.recepcionPaqueteFactura(
      createPaqueteDto,
      query,
    );
  }

  //? ============================================================================================== */
  //?                            Validacion_Paquete                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('paquetes/validacion')
  async validacionPaqueteFacturas(
    @Query() query: QueryDto,
    @Body() validacionPaqueteFacturaDto: ValidacionPaqueteFacturaDto,
  ) {
    return this.paquetesService.validacionPaqueteFactura(
      validacionPaqueteFacturaDto,
      query,
    );
  }
}
