import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

import { Customer } from 'src/modules/customers/entities/customer.entity';
import { User } from 'src/modules/users/entities/user.entity';

export const GetCustomer = createParamDecorator(
  (data: string, cxt: ExecutionContext) => {
    const req = cxt.switchToHttp().getRequest();
    const customer: User | Customer = req.user;

    if (!customer)
      throw new UnauthorizedException('Customer not found (request)');

    if (!(customer instanceof Customer)) {
      throw new UnauthorizedException('You need to be a customer');
    }

    return customer;
  },
);
