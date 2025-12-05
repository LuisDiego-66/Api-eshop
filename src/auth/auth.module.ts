import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { envs } from 'src/config/environments/environments';

import { CustomersModule } from 'src/modules/customers/customers.module';
import { UsersModule } from 'src/modules/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: '365d' /* envs.SIGN_OPTIONS */ },
    }),

    CustomersModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [PassportModule, GoogleStrategy],
})
export class AuthModule {}
