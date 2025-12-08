import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { UpdateCustomerDto } from './dto';
import { CustomerPaginationDto } from './pagination/customer-pagination.dto';

import { Auth, GetCustomer } from 'src/auth/decorators';

import { Roles } from 'src/auth/enums/roles.enum';
import { CustomerType } from './enums/customer-type.enum';

import { CustomersService } from './customers.service';

import { Customer } from './entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CustomerType,
  })
  findAll(@Query() customerpagination: CustomerPaginationDto) {
    return this.customersService.findAll(customerpagination);
  }

  //? ============================================================================================== */
  //?                                  Get_Customer                                                  */
  //? ============================================================================================== */

  //!
  @Auth()
  @ApiBearerAuth('access-token')
  //!
  @Get('me')
  async getCustomer(@GetCustomer() customer: Customer) {
    return this.customersService.getCustomer(customer); //! GetCustomer
  }

  //? ============================================================================================== */
  //?                                  FindOne_Order                                                 */
  //? ============================================================================================== */

  //!
  @Auth()
  @ApiBearerAuth('access-token')
  //!
  @Get('order/:id')
  async findOneOrder(
    @Param('id', ParseIntPipe) idOrder: number,
    @GetCustomer() customer: Customer,
  ) {
    return this.customersService.findOneOrder(idOrder, customer); //! GetCustomer
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
    return this.customersService.findOne(id);
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  //!
  @Auth(Roles.ADMIN)
  @ApiBearerAuth('access-token')
  //!
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
