import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateOrderInStoreDto, CreateOrderOnlineDto } from './dto';

import { Auth, GetUser } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { OrdersService } from './orders.service';
import { PricingService } from './pricing.service';

import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pricingService: PricingService,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post('in-store')
  createInStore(@Body() createOrderInStoreDto: CreateOrderInStoreDto) {
    return this.ordersService.createOrderInStore(createOrderInStoreDto);
  }

  @Auth() //! solo customers autenticados y superUser
  @ApiBearerAuth('access-token')
  @Post('online')
  createOnline(
    @Body() createOrderOnlineDto: CreateOrderOnlineDto,
    @GetUser() buyer: User | Customer,
  ) {
    return this.ordersService.createOrderOnline(createOrderOnlineDto, buyer);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                   ConfirmOrder                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post('confirm/:id')
  confirmManual(@Param('id') id: number) {
    return this.ordersService.confirmOrderManual(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                    CancelOrder                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @Post('cancel/:id')
  cancel(@Param('id') id: number) {
    return this.ordersService.cancelOrder(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.ordersService.findAll(pagination);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Auth()
  @ApiBearerAuth('access-token')
  @Post('reprice/:token')
  reprice(@Param('token') token: string) {
    return this.pricingService.rePrice(token);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  /*  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  } */
}
