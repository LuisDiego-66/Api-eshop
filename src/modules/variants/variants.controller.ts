import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  CreateTransactionDto,
  CreateVariantsDto,
  UpdateVariantDto,
} from './dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { TransactionsService } from './transaction.service';
import { VariantsService } from './variants.service';

//!
@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
//!

@ApiTags('Variants')
@Controller('variants')
export class VariantsController {
  constructor(
    private readonly variantsService: VariantsService,

    private readonly transactionsService: TransactionsService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                           Create_ProdcutColor                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Post()
  create(@Body() createVariantsDto: CreateVariantsDto) {
    return this.variantsService.createProductColor(createVariantsDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                          FindAll_ProductColors                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.variantsService.findAllProductColors(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                           FindOne_ProductColor                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.findOneProductColorWithStock(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                           Update_ProductColor                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantsService.updateProductColor(id, updateVariantDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       getStock                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get('stock/:id')
  getStock(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.getAvailableStock(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       AddStock                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Post('addstock')
  addStock(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }
}
