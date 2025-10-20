import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateOutfitDto, UpdateOutfitDto } from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { OutfitsService } from './outfits.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('Outfits')
@Controller('outfits')
export class OutfitsController {
  constructor(private readonly outfitsService: OutfitsService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Post()
  create(@Body() createOutfitDto: CreateOutfitDto) {
    return this.outfitsService.create(createOutfitDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.outfitsService.findAll(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.outfitsService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOutfitDto: UpdateOutfitDto,
  ) {
    return this.outfitsService.update(id, updateOutfitDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.outfitsService.remove(id);
  }
}
