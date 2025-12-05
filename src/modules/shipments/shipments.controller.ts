import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UpdateShipmentDto } from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { ShipmentsService } from './shipments.service';

@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  /* @Post()
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  } */

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  /* @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  } */

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.updateNational(id, updateShipmentDto);
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
