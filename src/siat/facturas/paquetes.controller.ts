import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { CreatePaqueteContingenciaDto } from './dto/create-paquete-contingencia.dto';

import { SettingsDto, SettingsPaginationDto } from '../common/dto/settings.dto';

import { PaquetesService } from './paquetes.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('SIAT: Paquetes')
@Controller('paquetes')
export class PaquetesController {
  constructor(private readonly paquetesService: PaquetesService) {}

  //? ============================================================================================== */
  //?                                Enviar_Paquete                                                  */
  //? ============================================================================================== */

  @Post()
  async recepcionPaqueteFacturas() {
    return this.paquetesService.recepcionPaqueteFactura();
  }

  //? ============================================================================================== */
  //?                   Enviar_Paquete_Contingencia                                                  */
  //? ============================================================================================== */

  @Post('contingencia')
  async recepcionPaqueteFacturasContingencia(
    @Body() dto: CreatePaqueteContingenciaDto,
  ) {
    return this.paquetesService.recepcionPaqueteFacturaContingencia(dto);
  }

  //? ============================================================================================== */
  //?                   Find_Eventos_Significativos_Pendientes_Por_Cafc                              */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @Get('contingencia/:cafc/eventos')
  async findEventosPendientesPorCafc(
    @Param('cafc') cafc: string,
    @Query() query: SettingsDto,
  ) {
    return this.paquetesService.findEventosPendientesPorCafc(cafc, query);
  }

  //? ============================================================================================== */
  //?                                     FindAll_Paquetes                                           */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  async findAllPaquetes(@Query() query: SettingsPaginationDto) {
    return this.paquetesService.findAll(query);
  }

  //? ============================================================================================== */
  //?                                     FindOne_Paquete                                            */
  //? ============================================================================================== */

  @Get(':id')
  async findOnePaquete(@Param('id') id: number) {
    return this.paquetesService.findOne(id);
  }

  //? ============================================================================================== */
  //?                            Validacion_Paquete                                                  */
  //? ============================================================================================== */

  @Post('validacion/:id')
  async validacionPaqueteFacturas(
    @Param('id') id: number,
    //@Body() validacionPaqueteFacturaDto: ValidacionPaqueteFacturaDto,
  ) {
    return this.paquetesService.validacionPaqueteFactura(id);
  }

  //? ============================================================================================== */
  //?                           Enviar_Email_Paquete                                                 */
  //? ============================================================================================== */

  /* @Post('send-email')
  async sendPaqueteEmail(@Body() dto: SendPaqueteEmailDto) {
    return this.facturacionService.sendPaqueteEmail(dto);
  } */
}
