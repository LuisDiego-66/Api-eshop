import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createAddressDto: CreateAddressDto) {
    try {
      const newAddress = this.addressRepository.create(createAddressDto);
      return await this.addressRepository.save(newAddress);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    //const { limit = 10, offset = 0 } = pagination;

    const addresses = await this.addressRepository.find({
      //take: limit,
      //skip: offset,
    });

    return addresses;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const address = await this.addressRepository.findOne({
      where: { id },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateAddreseDto: UpdateAddressDto) {
    const address = await this.findOne(id);
    try {
      Object.assign(address, updateAddreseDto);
      return await this.addressRepository.save(address);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const address = await this.findOne(id);
    try {
      await this.addressRepository.softRemove(address);
      return {
        message: 'Address deleted successfully',
        deleted: address,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
