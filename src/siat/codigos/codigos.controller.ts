import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CodigosService } from './codigos.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { SettingsDto } from '../common/dto/settings.dto';
import { VerificarNitDto } from './dto/verificar-nit.dto';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('SIAT: Codigos')
@Controller('codigos')
export class CodigosController {
  constructor(private readonly codigosService: CodigosService) {}

  //? ============================================================================================== */
  //?                                          CUIS                                                  */
  //? ============================================================================================== */
  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('cuis')
  async getCUIS(@Query() getcuis: SettingsDto) {
    return this.codigosService.getCUIS(getcuis);
  }

  //? ============================================================================================== */
  //?                                          CUFD                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('cufd')
  async getCUFD(@Query() getcufd: SettingsDto) {
    return this.codigosService.getCUFD(getcufd);
  }

  //? ============================================================================================== */
  //?                                    Verificar_NIT                                                */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('verificar-nit')
  async verificarNit(
    @Query() query: SettingsDto,
    @Body() dto: VerificarNitDto,
  ) {
    return this.codigosService.verificarNit(dto, query);
  }

  //? ============================================================================================== */
  //?                                      CUIS_ALL                                                  */
  //? ============================================================================================== */

  @Get('cuis/all')
  async getAllCUIS() {
    return this.codigosService.getAllCUIS();
  }

  //? ============================================================================================== */
  //?                                      CUFD_ALL                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @ApiQuery({ name: 'soloVigentes', required: false, type: Boolean })
  @Get('cufd/all')
  async getAllCUFD(
    @Query() query: SettingsDto,
    @Query('soloVigentes') soloVigentes?: string,
  ) {
    return this.codigosService.getAllCUFD(query, soloVigentes === 'true');
  }
}
