import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateSliderDto, UpdateSliderDto } from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { SlidersService } from './sliders.service';

@ApiTags('Sliders')
@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post()
  create(@Body() createSliderDto: CreateSliderDto) {
    return this.slidersService.create(createSliderDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll() {
    return this.slidersService.findAll();
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.slidersService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateSliderDto: UpdateSliderDto) {
    return this.slidersService.update(id, updateSliderDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.slidersService.remove(id);
  }
}
