import { UseGuards, applyDecorators } from '@nestjs/common';

import { Rol } from './roles.decorator';
import { Roles } from '../enums/roles.enum';
import { RolesGuard } from '../guards';
import { JwtAuthGuard } from '../guards';

export function Auth(...roles: Roles[]) {
  return applyDecorators(Rol(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
