import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Customer } from 'src/modules/customers/entities/customer.entity';
import { User } from 'src/modules/users/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: string, cxt: ExecutionContext) => {
    const req = cxt.switchToHttp().getRequest();
    const user: User | Customer = req.user;

    // el decorador se puede usar en el controlador para obtener el usuario
    if (!user) return undefined; //throw new InternalServerErrorException('User not found (request)');

    return user;
  },
);
