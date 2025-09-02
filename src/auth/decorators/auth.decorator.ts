import { UseGuards, applyDecorators } from '@nestjs/common';

import { Rol } from './roles.decorator';
import { Roles } from '../enums/roles.enum';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth(...roles: Roles[]) {
  return applyDecorators(Rol(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
