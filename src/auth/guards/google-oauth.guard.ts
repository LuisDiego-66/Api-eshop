import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions | undefined {
    const req = context.switchToHttp().getRequest();

    //* callback dinámico desde el query param
    const redirectUrl = req.query.callback;

    if (!redirectUrl) {
      throw new BadRequestException('redirectUrl is required');
    }

    // Validación opcional (recomendado)
    const allowed = [
      'https://www.moneroget.com/auth/callback',
      'https://moneroget.com/auth/callback',
      'http://localhost:3000/auth/callback',
    ];

    if (!allowed.includes(redirectUrl)) {
      throw new BadRequestException('Redirect URL no permitida');
    }

    return {
      //scope: ['email', 'profile'],
      callbackURL: redirectUrl, // callback dinámico
      session: false,
      state: redirectUrl, // Pasamos el redirectUrl como state para usarlo después
    };
  }
}
