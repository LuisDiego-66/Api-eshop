import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  CreateNationalShipmentDto,
  CreateInternationalShipmentDto,
  UpdateNationalShipmentDto,
  UpdateInternationalShipmentDto,
} from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { ShipmentsService } from './shipments.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  // National
  @Post('national')
  createNational(@Body() createNationalDto: CreateNationalShipmentDto) {
    return this.shipmentsService.createNational(createNationalDto);
  }

  // International
  @Post('international')
  createInternational(
    @Body() createInternationalDto: CreateInternationalShipmentDto,
  ) {
    return this.shipmentsService.createInternational(createInternationalDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.shipmentsService.findAll(pagination);
  }

  @Get('national')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAllNational(@Query() pagination: PaginationDto) {
    return this.shipmentsService.findAllNational(pagination);
  }

  @Get('international')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAllInterNational(@Query() pagination: PaginationDto) {
    return this.shipmentsService.findAllInterNational(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  // National
  @Patch('national:id')
  updateNational(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentDto: UpdateNationalShipmentDto,
  ) {
    return this.shipmentsService.updateNational(id, updateShipmentDto);
  }

  // International
  @Patch('international:id')
  updateInternational(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentDto: UpdateInternationalShipmentDto,
  ) {
    return this.shipmentsService.updateInternational(id, updateShipmentDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
