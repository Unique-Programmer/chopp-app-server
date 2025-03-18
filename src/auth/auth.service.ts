import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, UserRO } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';
import { AuthDto } from './dto/auth.dto';
import { ERROR_MESSAGES } from 'src/shared/enums';
import { USER_ROLE } from 'src/shared/enums';
import { SubmitLoginService } from '../submit-login/submit-login.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    // chnage to passport js
    private jwtService: JwtService,
    private submitLoginService: SubmitLoginService,
  ) {}

  private async generateTokens(user: User) {
    const payload = { email: user.email, id: user.id, roles: user.roles };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_ACCESS_EXPIRATION,
        secret: process.env.JWT_ACCESS_SECRET_HEX,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
        secret: process.env.JWT_REFRESH_SECRET_HEX,
      }),
    };
  }

  private getSixCharCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
  }

  async generateCode(phoneNumber: string) {
    let user = await this.usersService.getUserByFieldName(phoneNumber, 'phoneNumber');

    if (!user) {
      user = await this.usersService.createUser({ phoneNumber, isRegistered: false });
    }

    const code = this.getSixCharCode();
    await this.submitLoginService.sendVerificationCode(phoneNumber, code);

    const hashedCode = await bcrypt.hash(code, 5);

    await user.update({
      verificationCode: hashedCode,
      verificationExpires: new Date(Date.now() + 5 * 60 * 1000), // Действителен 5 минут
      verificationAttempts: 0, // Сбрасываем попытки
    });

    console.log(`🔹 Your verification code: ${code}`); // Заглушка вместо SMS

    return { message: `🔹 Your verification code: ${code}` };
  }

  async verifyCode(phoneNumber: string, code: string) {
    const user = await this.usersService.getUserByFieldName(phoneNumber, 'phoneNumber');

    if (!user || !user.verificationCode) {
      throw new UnauthorizedException('Invalid phone number or verification code.');
    }

    if (user.verificationAttempts >= 5) {
      throw new UnauthorizedException('Too many failed attempts. Please request a new code.');
    }

    if (new Date() > user.verificationExpires) {
      throw new UnauthorizedException('Verification code expired. Please request a new one.');
    }

    const isCodeValid = await bcrypt.compare(code, user.verificationCode);
    if (!isCodeValid) {
      await user.update({ verificationAttempts: user.verificationAttempts + 1 });
      throw new UnauthorizedException('Invalid verification code.');
    }

    await user.update({
      verificationCode: null,
      verificationAttempts: 0,
      isRegistered: true,
    });

    return this.generateTokens(user);
  }

  async resendCode(phoneNumber: string) {
    const user = await this.usersService.getUserByFieldName(phoneNumber, 'phoneNumber');
    if (!user) throw new UnauthorizedException('Phone number not found');

    if (user.verificationExpires && new Date() < user.verificationExpires) {
      throw new HttpException('Wait before requesting a new code', HttpStatus.TOO_MANY_REQUESTS);
    }

    return this.generateCode(phoneNumber);
  }

  private checkByRoleContext(user: User, context: USER_ROLE): boolean {
    const [role] = user.roles;

    return role.value === context;
  }

  private async checkValidityUser(authDto: AuthDto) {
    let user;

    if (authDto.email) {
      user = await this.usersService.getUserByFieldName(authDto.email, 'email', true);
    } else if (authDto.phoneNumber) {
      user = await this.usersService.getUserByFieldName(authDto.phoneNumber, 'phoneNumber', true);
    } else {
      throw new UnauthorizedException({
        message: ERROR_MESSAGES.INCORRECT_LOGIN_OR_PASSWORD,
      });
    }

    if (!user) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.INCORRECT_LOGIN_OR_PASSWORD });
    }

    if (!this.checkByRoleContext(user, authDto.context)) {
      throw new HttpException('Access denied for this role', HttpStatus.FORBIDDEN);
    }

    const isPasswordsEquals = await bcrypt.compare(authDto.password, user.password);
    if (!isPasswordsEquals) {
      throw new UnauthorizedException({ message: ERROR_MESSAGES.INCORRECT_LOGIN_OR_PASSWORD });
    }

    return user;
  }

  async login(authDto: AuthDto) {
    const user = await this.checkValidityUser(authDto);
    return this.generateTokens(user);
  }

  async registration(userDto: CreateUserDto) {
    const candidateByEmain = await this.usersService.getUserByFieldName(userDto.email, 'email');

    if (candidateByEmain) {
      throw new HttpException('User with this email already exist', HttpStatus.BAD_REQUEST);
    }

    const candidateByPhoneNumber = await this.usersService.getUserByFieldName(userDto.phoneNumber, 'phoneNumber');

    if (candidateByPhoneNumber) {
      throw new HttpException('User with this phone number already exist', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(userDto.password, 5);

    const user = await this.usersService.createUser({
      ...userDto,
      password: hashPassword,
    });

    return this.generateTokens(user);
  }

  verifyToken(token: string, secret: string): UserRO {
    try {
      const payload = this.jwtService.verify(token, { secret });
      return payload;
    } catch (e) {
      return null;
    }
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({ message: 'Refresh token not found' });
    }

    const payload = this.verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET_HEX);

    if (!payload) {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }

    const user = await this.usersService.getUserByFieldName(payload.id, 'id');

    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid user' });
    }

    return this.generateTokens(user);
  }

  async getUserByTokenPayload(accessToken: string) {
    try {
      const payload = this.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET_HEX);
      const user = await this.usersService.getUserByFieldName(payload.id, 'id');

      return user;
    } catch (e) {
      throw new HttpException(ERROR_MESSAGES.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
  }

  async authenticateSuperAdmin(login: string, password: string): Promise<boolean> {
    // Здесь должна быть логика для проверки учетных данных суперадмина,
    // например, сравнение с хранимыми значениями в переменных окружения
    return login === process.env.SUPERADMIN_LOGIN && password === process.env.SUPERADMIN_PASSWORD;
  }
}
