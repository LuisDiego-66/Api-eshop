import { ExecutionContext } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions | undefined {
    const req = context.switchToHttp().getRequest();

    const dynamicCallback = req.query.callback;

    return {
      scope: ['email', 'profile'],
      callbackURL: dynamicCallback, // callback dinámico
      session: false,
    };
  }
}
