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
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { OrderPaginationDto } from './pagination/order-pagination.dto';
import {
  ChangeStatusDto,
  CreateOrderInStoreDto,
  CreateOrderOnlineDto,
  UpdateOrderDto,
} from './dto';

import { Auth, GetCustomer } from 'src/auth/decorators';

import { OrderType } from './enums';
import { Roles } from 'src/auth/enums';

import { OrdersService } from './orders.service';
import { PricingService } from './pricing.service';

import { Customer } from '../customers/entities/customer.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pricingService: PricingService,
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
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: OrderType,
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
}
