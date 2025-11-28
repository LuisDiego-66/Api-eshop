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

import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { AdvertisementsService } from './advertisements.service';

@ApiTags('Advertisements')
@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post()
  create(@Body() createAdvertisementDto: CreateAdvertisementDto) {
    return this.advertisementsService.create(createAdvertisementDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       FindAll                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll() {
    return this.advertisementsService.findAll();
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       FindOne                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.advertisementsService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    return this.advertisementsService.update(id, updateAdvertisementDto);
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
    return this.advertisementsService.remove(id);
  }
}
