import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { CreateAddressDto, UpdateAddressDto } from './dto';

import { Address } from './entities/address.entity';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async create(createAddressDto: CreateAddressDto, customer?: Customer) {
    if (!customer) {
      throw new BadRequestException('Only customers can create addresses');
    }

    try {
      const newAddress = this.addressRepository.create({
        ...createAddressDto,
        customer,
        place: { id: createAddressDto.place },
      });
      return await this.addressRepository.save(newAddress);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  async findAll(customer?: Customer) {
    if (!customer) {
      throw new BadRequestException('Only customers can find addresses');
    }
    const addresses = await this.addressRepository.findBy({ id: customer.id });
    return addresses;
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  async findOne(id: number, customer?: Customer) {
    if (!customer) {
      throw new BadRequestException('Only customers can find addresses');
    }

    const address = await this.addressRepository.findOne({
      where: { id },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(
    id: number,
    updateAddreseDto: UpdateAddressDto,
    customer?: Customer,
  ) {
    const address = await this.findOne(id, customer);
    try {
      Object.assign(address, updateAddreseDto);
      return await this.addressRepository.save(address);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  async remove(id: number, customer?: Customer) {
    const address = await this.findOne(id, customer);
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
