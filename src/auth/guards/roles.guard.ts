import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from '../decorators/roles.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { Roles } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(
      META_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user: User | undefined = req.user; //! admin o customer

    // No está autenticado
    if (!user) throw new UnauthorizedException('User is not authenticated');

    // Admin pasa siempre
    if (user.rol === Roles.ADMIN) return true;

    // Existe rol? ¿Tiene alguno de los roles requeridos?
    if (user.rol && requiredRoles.includes(user.rol)) {
      return true;
    }

    throw new ForbiddenException(
      `Special permits required : ${requiredRoles.join(', ')}`,
    );
  }
}
