import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { expireParseByHours } from 'src/shared/utils';
import { AuthDto, LoginDto, RefreshDto, VerifyCodeDto } from './dto/auth.dto';
import { RolesGuard } from 'src/auth/roles-auth.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { User } from 'src/users/users.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/login')
  async login(@Body() authDto: AuthDto, @Res({ passthrough: true }) response) {
    const data = await this.authService.login(authDto);
    response.cookie('refreshToken', data.refreshToken, {
      maxAge: expireParseByHours(process.env.JWT_REFRESH_EXPIRATION),
      httpOnly: true,
    });
    return data;
  }

  @ApiOperation({
    summary: 'Use phone number or email, password for login',
  })
  @ApiResponse({ status: 200, type: [User] })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/adminLogin')
  async adminLogin(@Body() authDto: AuthDto, @Res({ passthrough: true }) response) {
    const data = await this.authService.login(authDto);
    response.cookie('refreshToken', data.refreshToken, {
      maxAge: expireParseByHours(process.env.JWT_REFRESH_EXPIRATION),
      httpOnly: true,
    });
    return data;
  }

  @Post('/registration')
  async registration(@Body() userDto: CreateUserDto, @Res({ passthrough: true }) response) {
    const data = await this.authService.registration(userDto);
    response.cookie('refreshToken', data.refreshToken, {
      maxAge: expireParseByHours(process.env.JWT_REFRESH_EXPIRATION),
      httpOnly: true,
    });
    return data;
  }

  @Post('/refresh')
  async refresh(@Body() { refreshToken }: RefreshDto, @Req() request, @Res({ passthrough: true }) response) {
    // can use it, if "refresh in cookies" case
    // const { refreshToken: cookiesRefreshToken } = request.cookies;

    const data = await this.authService.refresh(refreshToken);
    response.cookie('refreshToken', data.refreshToken, {
      maxAge: expireParseByHours(process.env.JWT_REFRESH_EXPIRATION),
      httpOnly: true,
    });

    return data;
  }

  @Post('/generateCode')
  @ApiOperation({ summary: 'Request a verification code' })
  async generateCode(@Body() { phoneNumber }: LoginDto) {
    return this.authService.generateCode(phoneNumber);
  }

  @Post('/verify')
  @ApiOperation({ summary: 'Verify the code and get tokens' })
  async verifyCode(@Body() { phoneNumber, code }: VerifyCodeDto) {
    return this.authService.verifyCode(phoneNumber, code);
  }

  @Post('/resend-code')
  @ApiOperation({ summary: 'Resend verification code' })
  async resendCode(@Body() { phoneNumber }: LoginDto) {
    return this.authService.resendCode(phoneNumber);
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Body() { refreshToken }: { refreshToken: string }) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const payload = this.authService.verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET_HEX);

      if (payload?.id) {
        const user = await this.authService.getUserByTokenPayload(refreshToken);

        if (user) {
          await user.update({ refreshToken: null });
        }
      }
    } catch (e) {
      console.log(`LOGOUT ERROR: ${JSON.stringify(e)}`)
    }

    return { message: 'Logged out successfully' };
  }
}
