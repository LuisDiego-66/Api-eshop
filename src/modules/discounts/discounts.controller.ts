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

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('seasonal')
  createSeasonal(
    @Body()
    createDiscountDto: CreateSeasonalDiscountDto,
  ) {
    return this.discountsService.create(createDiscountDto);
  }

  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('permanent')
  createPermanent(
    @Body()
    createDiscountDto: CreatePermanentDiscountDto,
  ) {
    return this.discountsService.create(createDiscountDto);
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.discountsService.findAll(pagination);
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  @Get('first-discount')
  findFirstDiscount() {
    return this.discountsService.findFirstDiscount();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch('seasonal/:id')
  updateSeasonal(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateDiscountDto: UpdateSeasonalDiscountDto,
  ) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch('permanent/:id')
  updatePermanent(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateDiscountDto: UpdatePermanentDiscountDto,
  ) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Delete('permanents')
  removePermanent() {
    return this.discountsService.removePermanent();
  }

  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Delete('seasonals')
  removeSeasonal() {
    return this.discountsService.removeSeasonal();
  }

  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }
}
