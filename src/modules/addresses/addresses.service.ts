import { Injectable } from '@nestjs/common';
import { CreateAddreseDto } from './dto/create-address.dto';
import { UpdateAddreseDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  create(createAddreseDto: CreateAddreseDto) {
    return 'This action adds a new addrese';
  }

  findAll() {
    return `This action returns all addreses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} addrese`;
  }

  update(id: number, updateAddreseDto: UpdateAddreseDto) {
    return `This action updates a #${id} addrese`;
  }

  remove(id: number) {
    return `This action removes a #${id} addrese`;
  }
}
