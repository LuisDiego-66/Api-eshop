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

import { UpdateCustomerDto, CustomerPaginationDto } from './dto';

import { CustomersService } from './customers.service';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums/roles.enum';

import { CustomerType } from './enums/customer-type.enum';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

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

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
