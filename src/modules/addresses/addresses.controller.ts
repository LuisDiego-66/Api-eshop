import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddreseDto } from './dto/create-address.dto';
import { UpdateAddreseDto } from './dto/update-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Body() createAddreseDto: CreateAddreseDto) {
    return this.addressesService.create(createAddreseDto);
  }

  @Get()
  findAll() {
    return this.addressesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddreseDto: UpdateAddreseDto) {
    return this.addressesService.update(+id, updateAddreseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }
}
