import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CodigosService } from './codigos.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { QueryDto } from '../common/dto/query.dto';
import { VerificarNitDto } from './dto/verificar-nit.dto';

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
  async getCUIS(@Query() getcuis: QueryDto) {
    return this.codigosService.getCUIS(getcuis);
  }

  //? ============================================================================================== */
  //?                                          CUFD                                                  */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('cufd')
  async getCUFD(@Query() getcufd: QueryDto) {
    return this.codigosService.getCUFD(getcufd);
  }

  //? ============================================================================================== */
  //?                                    Verificar_NIT                                                */
  //? ============================================================================================== */

  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post('verificar-nit')
  async verificarNit(
    @Query() query: QueryDto,
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

  @Get('cufd/all')
  async getAllCUFD() {
    return this.codigosService.getAllCUFD();
  }
}
