import {
  Get,
  Post,
  Body,
  Param,
  Query,
  Controller,
  ParseIntPipe,
  Patch,
  Put,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { OrderPaginationDto } from './pagination/order-pagination.dto';
import {
  ChangeStatusDto,
  CreateOrderInStoreDto,
  CreateOrderOnlineDto,
  UpdateOrderDto,
} from './dto';

import { Auth, GetCustomer } from 'src/auth/decorators';

import { OrderStatus, OrderType, PaymentType } from './enums';
import { Roles } from 'src/auth/enums';

import { OrdersService } from './orders.service';
import { PricingService } from './pricing.service';
import { ExelService } from 'src/exel/exel.service';

import { Customer } from '../customers/entities/customer.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,

    private readonly pricingService: PricingService,

    private readonly exelService: ExelService,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('in-store')
  createInStore(@Body() createOrderInStoreDto: CreateOrderInStoreDto) {
    return this.ordersService.createOrderInStore(createOrderInStoreDto);
  }

  //? ============================================================================================== */

  //!
  @Auth()
  @ApiBearerAuth('access-token')
  //!
  @Post('online')
  createOnline(
    @Body() createOrderOnlineDto: CreateOrderOnlineDto,
    @GetCustomer() buyer: Customer, //! GetUser
  ) {
    return this.ordersService.createOrderOnline(createOrderOnlineDto, buyer);
  }

  //? ============================================================================================== */
  //?                                  Confirm_Order                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('confirm/:id')
  confirmManual(@Param('id') id: number) {
    return this.ordersService.confirmOrderManual(id);
  }

  //? ============================================================================================== */
  //?                                   Cancel_Order                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('cancel/:id')
  cancel(@Param('id') id: number) {
    return this.ordersService.cancel(id);
  }

  //? ============================================================================================== */
  //?                          Cancel_Order_For_Edit                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Post('cancel-for-edit/:id')
  cancelForEdit(@Param('id') id: number) {
    return this.ordersService.cancel(id);
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
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
  @Get()
  findAll(@Query() pagination: OrderPaginationDto) {
    return this.ordersService.findAll(pagination);
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  //? ============================================================================================== */
  //?                                        Reprice                                                 */
  //? ============================================================================================== */

  @Post('reprice/:token')
  reprice(@Param('token') token: string) {
    return this.pricingService.rePrice(token);
  }

  //? ============================================================================================== */
  //?                                         Update                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto.items);
  }
  //? ============================================================================================== */
  //?                                  Change_Status                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Put(':id')
  changeStatus(
    @Param('id') id: number,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return this.ordersService.changeStatus(id, changeStatusDto);
  }

  //? ============================================================================================== */
  //?                                         Export                                                 */
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
  @Get('export/exel')
  async exportExcel(
    @Query() pagination: OrderPaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.ordersService.export(pagination);
    return this.exelService.exportOrdersToExcel(result, res);
  }
}
