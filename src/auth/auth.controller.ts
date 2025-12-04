import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GoogleOauthGuard } from './guards';

import { CreateSubscriberDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //? ============================================================================================== */
  //?                                        Login                                                   */
  //? ============================================================================================== */

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  //? ============================================================================================== */
  //?                                    Subscribe                                                   */
  //? ============================================================================================== */

  @Post('subscribe')
  subscribe(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.authService.createCustomerSubscribe(createSubscriberDto);
  }

  //? ============================================================================================== */
  //?                                       Google                                                   */
  //? ============================================================================================== */

  //! redirecciona al inicio de session de google
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  //? ============================================================================================== */
  //?                              Google CallBack                                                   */
  //? ============================================================================================== */

  //se ejecuta cuando google me llama con sus datos directamente a mi servidor
  //@Get('google/callback')

  //! se ejecuta cuando el front me llama con los datos de google
  @Post('google/exchange')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req) {
    const customer = req.user;
    return this.authService.signIn(customer);
  }
}
