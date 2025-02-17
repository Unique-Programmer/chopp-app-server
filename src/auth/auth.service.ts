import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, UserRO } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';
import { AuthDto } from './dto/auth.dto';
import { USER_ROLE } from 'src/shared/enums';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    // chnage to passport js
    private jwtService: JwtService,
  ) { }

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

  private checkByRoleContext(user: User, context: USER_ROLE): boolean {
    const [role] = user.roles;

    return role.value === context;
  }

  private async checkValidityUser(authDto: AuthDto) {

    let user;

    console.log('authDto: ', authDto);
    if (authDto.email) {
      user = await this.usersService.getUserByFieldName(
        authDto.email,
        'email',
        true,
      );
    } else if (authDto.phoneNumber) {
      user = await this.usersService.getUserByFieldName(
        authDto.phoneNumber,
        'phoneNumber',
        true,
      );
    } else {
      throw new UnauthorizedException({
        message: 'User not found',
      });
    }

    if (!user) {
      throw new UnauthorizedException({ message: 'User not found.' });
    }

    if (!this.checkByRoleContext(user, authDto.context)) {
      throw new HttpException('Access denied for this role', HttpStatus.FORBIDDEN);
    };

    const isPasswordsEquals = await bcrypt.compare(
      authDto.password,
      user.password,
    );
    if (!isPasswordsEquals) {
      throw new UnauthorizedException({ message: 'User not found..' });
    }

    return user;
  }

  async login(authDto: AuthDto) {
    const user = await this.checkValidityUser(authDto);
    return this.generateTokens(user);
  }

  async registration(userDto: CreateUserDto) {
    const candidateByEmain = await this.usersService.getUserByFieldName(
      userDto.email,
      'email',
    );

    if (candidateByEmain) {
      throw new HttpException(
        'User with this email already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const candidateByPhoneNumber = await this.usersService.getUserByFieldName(
      userDto.phoneNumber,
      'phoneNumber',
    );

    if (candidateByPhoneNumber) {
      throw new HttpException(
        'User with this phone number already exist',
        HttpStatus.BAD_REQUEST,
      );
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

    const payload = this.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_HEX,
    );

    if (!payload) {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }

    const user = await this.usersService.getUserByFieldName(payload.id, 'id');

    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid user' });
    }

    console.log('----this.generateTokens(user): ', this.generateTokens(user));

    return this.generateTokens(user);
  }

  async getUserByTokenPayload(accessToken: string) {
    try {
      const payload = this.verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET_HEX,
      );
      const user = await this.usersService.getUserByFieldName(payload.id, 'id');

      return user;
    } catch (e) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
  }

  async authenticateSuperAdmin(
    login: string,
    password: string,
  ): Promise<boolean> {
    // Здесь должна быть логика для проверки учетных данных суперадмина,
    // например, сравнение с хранимыми значениями в переменных окружения
    return (
      login === process.env.SUPERADMIN_LOGIN &&
      password === process.env.SUPERADMIN_PASSWORD
    );
  }
}
