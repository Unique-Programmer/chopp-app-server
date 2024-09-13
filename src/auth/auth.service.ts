import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        // поменять на passport js
        private jwtService: JwtService
    ) {}

    private async generateToken(user: User) {
        const payload = { email: user.email, id: user.id, roles: user.roles };

        return {
            /* 
                todo: переделать на получение двух токенов через
                accessToken: this.jwtService.sign(payload, {
                    expiresIn: '',
                    secret: '',
                }),
                refreshToken: this.jwtService.sign(payload, {
                    expiresIn: '',
                    secret: '',
                }),
                убрать параметры из JwtModule.register
            */
            token: this.jwtService.sign(payload),
        } 
    }

    private async sanitizeUser(userDto: CreateUserDto) {
        const user = await this.usersService.getUserByEmail(userDto.email);

        if (!user) {
            throw new UnauthorizedException({ message: 'Пользователь не найден' });
        }
        const isPasswordsEquals = await bcrypt.compare(userDto.password, user.password);

        if (user && isPasswordsEquals) {
            return user;
        }

        throw new UnauthorizedException({ message: 'Неверный пароль' });
    }

    async login(userDto: CreateUserDto) {
        const user = await this.sanitizeUser(userDto);
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.usersService.getUserByEmail(userDto.email);

        if (candidate) {
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST);
        }

        const hashPassword = await bcrypt.hash(userDto.password, 5);

        const user = await this.usersService.createUser({ ...userDto, password: hashPassword });

        return this.generateToken(user);
    }
}
