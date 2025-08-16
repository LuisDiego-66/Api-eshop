import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'; //! strategy JWT
import { envs } from 'src/config/environments/environments';
//? ---------------------------------------------------------------------------------------------- */
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { LoginType } from 'src/common/enums/login-type.enum';
import { UsersService } from 'src/modules/users/users.service';
import { CustomersService } from 'src/modules/customers/customers.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService, // Import your user service
    private readonly customerService: CustomersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envs.JWT_SECRET,
    });
  }

  async validate(jwtPayload: IJwtPayload) {
    const { id, type } = jwtPayload;

    if (type === LoginType.user) {
      const user = await this.userService.findOne(id);
      if (!user) throw new UnauthorizedException('Token inválido (user)');
      return user;
    }

    if (type === LoginType.customer) {
      const customer = await this.customerService.findOne(id);
      if (!customer)
        throw new UnauthorizedException('Token inválido (customer)');
      return customer;
    }

    throw new UnauthorizedException('Unrecognized type');
  }
}
