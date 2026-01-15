import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

import { Response } from 'express';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  AddStockDto,
  SubtractStockDto,
  CreateVariantsDto,
  UpdateVariantDto,
} from './dto';

import { Auth } from 'src/auth/decorators';

import { Roles } from 'src/auth/enums';

import { ExelService } from 'src/exel/exel.service';
import { VariantsService } from './variants.service';
import { OrdersService } from '../orders/orders.service';
import { TransactionsService } from './transaction.service';
import { OrderPaginationDto } from '../orders/pagination/order-pagination.dto';
import { OrderStatus, OrderType, PaymentType } from '../orders/enums';

@ApiTags('Variants')
@Controller('variants')
export class VariantsController {
  constructor(
    private readonly variantsService: VariantsService,

    private readonly transactionsService: TransactionsService,

    private readonly exelService: ExelService,

    private readonly ordersService: OrdersService,
  ) {}

  //? ============================================================================================== */
  //?                           Create_ProdcutColor                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post()
  create(@Body() createVariantsDto: CreateVariantsDto) {
    return this.variantsService.createProductColor(createVariantsDto);
  }

  //? ============================================================================================== */
  //?                          FindAll_ProductColors                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.variantsService.findAllProductColors(pagination);
  }

  //? ============================================================================================== */
  //?                           FindOne_ProductColor                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.findOneProductColorWithStock(id);
  }

  //? ============================================================================================== */
  //?                           Update_ProductColor                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.variantsService.updateProductColor(id, updateVariantDto);
  }

  //? ============================================================================================== */
  //?                                       getStock                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get('stock/:id')
  getStock(@Param('id', ParseIntPipe) id: number) {
    return this.variantsService.getAvailableStock(id);
  }

  //? ============================================================================================== */
  //?                                      Add_Stock                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('addstock')
  addStock(@Body() addStockDto: AddStockDto) {
    return this.transactionsService.addStock(addStockDto);
  }

  //? ============================================================================================== */
  //?                                 Subtract_Stock                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('subtractstock')
  subtractStock(@Body() subtractStock: SubtractStockDto) {
    return this.transactionsService.SubtractStock(subtractStock);
  }

  //? ============================================================================================== */
  //?                              Get_Best_Sellers                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get('dashboard/bestsellers')
  getBestSellers() {
    return this.variantsService.getBestSellers();
  }

  //? ============================================================================================== */
  //?                                 Get_low_stock                                                  */
  //? ============================================================================================== */
  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get('dashboard/lowStock')
  getLowStock() {
    return this.variantsService.getLowStock();
  }

  //? ============================================================================================== */
  //?                                         Export                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get('export/exel')
  async exportExcel(@Res() res: Response) {
    const { variants, stockMap } = await this.variantsService.exportToExel();
    await this.exelService.exportVariants(res, variants, stockMap);
  }

  //? ============================================================================================== */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get('export/transactions/exel')
  async exportToExelWhitTransactions(@Res() res: Response) {
    const { variants } =
      await this.variantsService.exportToExelWhitTransactions();
    return await this.exelService.exportvariantsTransactions(variants, res);
  }

  //? ============================================================================================== */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: OrderType,
  })
  @ApiQuery({
    name: 'paymentType',
    required: false,
    enum: PaymentType,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
  })
  @Get('export/total-sales/exel')
  async totalSales(
    @Query() pagination: OrderPaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.ordersService.export(pagination);
    return await this.exelService.exportOrdersTotal(result, res);
  }
}
