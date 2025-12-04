import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2'; //! strategy JWT

import { envs } from 'src/config/environments/environments';

import { AuthProviders } from '../enums/providers.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: envs.GOOGLE_ID_OAUTH,
      clientSecret: envs.GOOGLE_SECRET_KEY,
      callbackURL: envs.GOOGLE_CALLBACK,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  validate(
    req: any,
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: any,
  ) {
    const { id, name, email } = profile;

    const customer = {
      provider: AuthProviders.GOOGLE,
      idProvider: id,
      email: email,
      name: `${name.givenName} ${name.familyName}`,

      //! Pasar el redirectUrl original desde el state por si es necesario
      redirectUrl: req.query.state || req.state,
    };

    return customer;
  }
}
