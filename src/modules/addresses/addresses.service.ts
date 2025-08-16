import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Address } from './entities/address.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateAddressDto, UpdateAddressDto } from './dto';

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
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const addresses = await this.addressRepository.find({
      take: limit,
      skip: offset,
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
      this.handleDBExceptions(error);
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
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

    throw new InternalServerErrorException(error.message);
  }
}
