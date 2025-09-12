import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dtos/pagination';
import { UpdateCustomerDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const customers = await this.customerRepository.find({
      take: limit,
      skip: offset,
    });

    return customers;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                 FindOneByEmail                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOneByEmail(email: string) {
    const customer = await this.customerRepository.findOneBy({ email });
    return customer;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    try {
      Object.assign(customer, updateCustomerDto);
      return await this.customerRepository.save(customer);
    } catch (error) {
      console.log(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const customer = await this.findOne(id);
    try {
      await this.customerRepository.softRemove(customer);
      return {
        message: 'Customer deleted successfully',
        deleted: customer,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
