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

import { Auth, GetCustomer, GetUser } from 'src/auth/decorators';

import { OrderStatus, OrderType, PaymentType } from './enums';
import { Roles } from 'src/auth/enums';

import { OrdersService } from './orders.service';
import { PricingService } from './pricing.service';
import { ExelService } from 'src/exel/exel.service';

import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';
import { SearchBillingDto } from './pagination/search-billing-filter.dto';

import { QueryDto } from 'src/siat/common/dto/query.dto';

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
  //?                                  Facturar_Order                                                */
  //? ============================================================================================== */

  /* //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @ApiQuery({ name: 'codigoPuntoVenta', required: true, type: Number })
  @ApiQuery({ name: 'codigoSucursal', required: true, type: Number })
  @Post(':id/facturar')
  facturar(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryDto,
    @GetUser() user: User,
  ) {
    return this.orderFacturaService.generarFacturaDesdeOrden(
      id,
      query,
      user.name,
    );
  } */

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
    return this.ordersService.cancelForEdit(id);
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

  //! billing search
  @ApiQuery({
    name: 'ci',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'orderId',
    required: false,
    type: Number,
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
  //?                             Search_For_Billing                                                 */
  //? ============================================================================================== */

  /* //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @ApiQuery({
    name: 'ci',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'orderId',
    required: false,
    type: Number,
  })
  @Get('search/billing')
  searchForBilling(@Query() search: SearchBillingDto) {
    return this.ordersService.searchForBilling(search);
  } */

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
  async exportOrders(
    @Query() pagination: OrderPaginationDto,
    @Res() res: Response,
  ) {
    const result = await this.ordersService.export(pagination);
    return await this.exelService.exportOrders(result, res);
  }
}
