import { ExecutionContext } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions | undefined {
    const req = context.switchToHttp().getRequest();

    //* callback dinámico desde el query param
    const dynamicCallback = req.query.callback;

    console.log(dynamicCallback);

    return {
      //scope: ['email', 'profile'],
      callbackURL: dynamicCallback, // callback dinámico
      session: false,
    };
  }
}
