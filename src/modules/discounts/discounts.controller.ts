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
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/dtos/pagination';
import {
  CreateSeasonalDiscountDto,
  CreatePermanentDiscountDto,
  UpdateSeasonalDiscountDto,
  UpdatePermanentDiscountDto,
} from './dto';

import { DiscountsService } from './discounts.service';

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
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
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
