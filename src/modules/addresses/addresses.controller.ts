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

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto';

import { Auth, GetUser } from 'src/auth/decorators';

import { Customer } from '../customers/entities/customer.entity';
import { User } from '../users/entities/user.entity';

import { AddressesService } from './addresses.service';

@Auth()
@ApiBearerAuth('access-token')
@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Post()
  create(
    @Body() createAddreseDto: CreateAddressDto,
    @GetUser() customer: User | Customer,
  ) {
    return this.addressesService.create(createAddreseDto, customer);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get()
  findAll(pagination: PaginationDto, @GetUser() customer: User | Customer) {
    return this.addressesService.findAll(pagination, customer);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.findOne(id);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddreseDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, updateAddreseDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(id);
  }
}
