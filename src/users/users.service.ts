import { Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private roleService: RolesService,
    ) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue('USER');
        // роль добавляется в базу позже и чтобы доп запрос из базы не делать:
        user.roles = [role];
        await user.$set('roles', [role.id]);

        return user;
    }

    async getAllUsers() {
        const users = this.userRepository.findAll({ include: { all: true } });

        return users;
    }

    async getUserByEmail(email: string) {
        /* 
            include: { all: true } для поиска всех значений,
            в том числе по ForeignKey в промежуточной базе данных
            в данном случае ролей
        */
        const user = await this.userRepository.findOne({ where: { email }, include: { all: true } });

        return user;
    }
}
