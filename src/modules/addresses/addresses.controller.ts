import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateAddressDto, UpdateAddressDto } from './dto';

import { Auth, GetCustomer } from 'src/auth/decorators';

import { Customer } from '../customers/entities/customer.entity';

import { AddressesService } from './addresses.service';

//!
@Auth()
@ApiBearerAuth('access-token')
//!

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  @Post()
  create(
    @Body() createAddreseDto: CreateAddressDto,
    @GetCustomer() customer: Customer,
  ) {
    return this.addressesService.create(createAddreseDto, customer);
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  @Get()
  findAll(@GetCustomer() customer: Customer) {
    return this.addressesService.findAll(customer);
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetCustomer() customer: Customer,
  ) {
    return this.addressesService.findOne(id, customer);
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddreseDto: UpdateAddressDto,
    @GetCustomer() customer: Customer,
  ) {
    return this.addressesService.update(id, updateAddreseDto, customer);
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetCustomer() customer: Customer,
  ) {
    return this.addressesService.remove(id, customer);
  }
}
