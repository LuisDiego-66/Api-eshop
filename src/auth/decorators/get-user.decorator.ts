import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

import { Customer } from 'src/modules/customers/entities/customer.entity';
import { User } from 'src/modules/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: string, cxt: ExecutionContext) => {
    const req = cxt.switchToHttp().getRequest();
    const user: User | Customer = req.user;

    if (!user) throw new UnauthorizedException('User not found (request)');

    if (!(user instanceof User)) {
      throw new UnauthorizedException('You need to be a customer');
    }

    return user;
  },
);
