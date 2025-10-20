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
import { CreateColorDto, UpdateColorDto } from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { ColorsService } from './colors.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */
  /*   @Post()
  create(@Body() createColorDto: CreateColorDto) {
    return this.colorsService.create(createColorDto);
  } */

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.colorsService.findAll(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */
  /*   @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    return this.colorsService.update(id, updateColorDto);
  } */

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  /*   @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.remove(id);
  } */
}
