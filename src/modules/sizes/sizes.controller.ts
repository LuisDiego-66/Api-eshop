import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { SizesService } from './sizes.service';

//!
@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
//!

@ApiTags('Sizes')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  /*   @Post()
  create(@Body() createSizeDto: CreateSizeDto) {
    return this.sizesService.create(createSizeDto);
  } */

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.sizesService.findAll(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  /*   @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSizeDto: UpdateSizeDto,
  ) {
    return this.sizesService.update(id, updateSizeDto);
  }
 */
  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  /*   @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sizesService.remove(id);
  } */
}
