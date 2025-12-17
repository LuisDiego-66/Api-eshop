import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { paginate } from 'src/common/pagination/paginate';
import { CustomerPaginationDto } from './pagination/customer-pagination.dto';
import { UpdateCustomerDto } from './dto';

import { OrdersService } from '../orders/orders.service';

import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    private readonly ordersService: OrdersService,
  ) {}

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  async findAll(pagination: CustomerPaginationDto) {
    const options: any = {
      where: {},
    };

    if (pagination.type) {
      options.where.type = pagination.type;
    }

    return paginate(this.customerRepository, options, pagination, [
      'name',
      'email',
    ]);
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { id },
      select: { id: true, email: true, name: true, type: true, provider: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  //? ============================================================================================== */
  //?                                 FindOneByEmail                                                 */
  //? ============================================================================================== */

  async findOneByEmail(email: string) {
    const customer = await this.customerRepository.findOneBy({ email });
    return customer;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    try {
      Object.assign(customer, updateCustomerDto);
      return await this.customerRepository.save(customer);
    } catch (error) {
      console.log(error);
    }
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

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

  //? ============================================================================================== */
  //?                                  Get_Customer                                                  */
  //? ============================================================================================== */

  async getCustomer(customer: Customer) {
    return await this.customerRepository.findOne({
      where: { id: customer.id },
      relations: { address: { place: true }, orders: true },
    });
  }

  //? ============================================================================================== */
  //?                                 FindOne_Order                                                  */
  //? ============================================================================================== */

  async findOneOrder(idOrder: number, customer: Customer) {
    return await this.ordersService.findOne(idOrder, customer);
  }

  //? ============================================================================================== */
  //?                                  Cancel_Order                                                  */
  //? ============================================================================================== */

  async cancelOrder(idOrder: number, customer: Customer) {
    return await this.ordersService.cancelForCustomer(idOrder, customer);
  }
}
