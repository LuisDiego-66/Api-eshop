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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  CreateSeasonalDiscountDto,
  CreatePermanentDiscountDto,
  UpdateSeasonalDiscountDto,
  UpdatePermanentDiscountDto,
} from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { DiscountsService } from './discounts.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Post('seasonal')
  createSeasonal(
    @Body()
    createDiscountDto: CreateSeasonalDiscountDto,
  ) {
    return this.discountsService.create(createDiscountDto);
  }

  @Post('permanent')
  createPermanent(
    @Body()
    createDiscountDto: CreatePermanentDiscountDto,
  ) {
    return this.discountsService.create(createDiscountDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.discountsService.findAll(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Patch('seasonal/:id')
  updateSeasonal(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateDiscountDto: UpdateSeasonalDiscountDto,
  ) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Patch('permanent/:id')
  updatePermanent(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateDiscountDto: UpdatePermanentDiscountDto,
  ) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }
}
