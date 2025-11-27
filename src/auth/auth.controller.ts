import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GoogleOauthGuard } from './guards';

import { CreateSubscriberDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Login                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                    Subscribe                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  @Post('subscribe')
  subscribe(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.authService.createCustomerSubscribe(createSubscriberDto);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                       Google                                                   */
  //? ---------------------------------------------------------------------------------------------- */

  //! redirecciona al inicio de session de google
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                              Google CallBack                                                   */
  //? ---------------------------------------------------------------------------------------------- */
  //! se ejecuta cuando google redirecciona al usuario de vuelta a la aplicacion
  //@Get('google/callback')
  @Post('google/exchange')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req /*  @Res() res: Response */) {
    const customer = req.user; //!  (en passport siempre en req.user)

    // genera el token JWT y registra el usuario si no existe
    return this.authService.signIn(customer);
  }
}
