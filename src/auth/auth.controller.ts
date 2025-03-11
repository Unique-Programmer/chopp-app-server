import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
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
  async registration(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response,
  ) {
    const data = await this.authService.registration(userDto);
    response.cookie('refreshToken', data.refreshToken, {
      maxAge: expireParseByHours(process.env.JWT_REFRESH_EXPIRATION),
      httpOnly: true,
    });
    return data;
  }

  @Post('/refresh')
  async refresh(
    @Body() { refreshToken }: RefreshDto,
    @Req() request,
    @Res({ passthrough: true }) response,
  ) {
    // can use it, if "refresh in cookies" case
    // const { refreshToken: cookiesRefreshToken } = request.cookies;

    const data = await this.authService.refresh(refreshToken);
    response.cookie('refreshToken', data.refreshToken, {
      maxAge: expireParseByHours(process.env.JWT_REFRESH_EXPIRATION),
      httpOnly: true,
    });

    return data;
  }




  @Post('/loginByCode')
  @ApiOperation({ summary: 'Request a verification code' })
  async loginByCode(@Body() { phoneNumber }: LoginDto) {
    return this.authService.loginByCode(phoneNumber);
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
}
