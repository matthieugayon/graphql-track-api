import {
  Req, Controller, HttpCode,
  Post, UseGuards, Body
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RequestWithUser } from './types/request-with-user.interface';
import { LocalAuthenticationGuard } from './guards/local-auth.guard';
import { LogInDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Body() _logInDto: LogInDto, @Req() request: RequestWithUser) {
    const { user } = request;
    const accessToken = await this.authService.getAccessToken(user);

    return {
      access_token: accessToken,
      user
    };
  }
}
