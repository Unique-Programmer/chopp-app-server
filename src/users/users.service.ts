import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from 'src/roles/roles.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/roles.model';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Role) private roleRepository: typeof Role,
    private roleService: RolesService,
  ) {}

  async createAdmin(
    createAdminDto: Omit<
      CreateAdminDto,
      'superadminLogin' | 'superadminPassword'
    >,
  ): Promise<User> {
    const { adminLogin, adminPassword } = createAdminDto;

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newUser = await this.userRepository.create({
      email: adminLogin,
      password: hashedPassword,
      fullName: 'New Admin',
      phoneNumber: '000-000-0000',
    });

    const adminRole = await this.roleRepository.findOne({
      where: { value: 'ADMIN' },
    });
    if (!adminRole) {
      throw new Error('Admin role not found. Please seed the roles.');
    }

    await newUser.$set('roles', [adminRole.id]);
    return newUser;
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);
    const role = await this.roleService.getRoleByValue('USER');
    // role creation after user is created
    user.roles = [role];
    await user.$set('roles', [role.id]);

    return user;
  }

  async updateUser(payload: CreateUserDto, userModel: User) {
    // check if possible change to {...user, ...payload} spreading for conditions deleting
    if (payload?.email) {
      const candidate = await this.getUserByFieldName(payload?.email, 'email');

      if (candidate) {
        throw new HttpException(
          'User with this email already exist',
          HttpStatus.BAD_REQUEST,
        );
      }

      userModel.update({ email: payload.email });
    }
    if (payload?.password) {
      const hashPassword = await bcrypt.hash(payload.password, 5);
      userModel.update({ password: hashPassword });
    }
    if (payload?.fullName) {
      userModel.update({ fullName: payload.fullName });
    }
    if (payload?.phoneNumber) {
      userModel.update({ phoneNumber: payload.phoneNumber });
    }

    return userModel;
  }

  async updateCurrentUser(
    payload: UpdateUserDto,
    userModel: User,
  ): Promise<User> {
    // Проверяем и обновляем email, если он предоставлен и отличается от текущего
    if (payload?.email && payload.email !== userModel.email) {
      if (
        await this.isFieldTakenByAnotherUser(
          payload.email,
          'email',
          userModel.id,
        )
      ) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      userModel.email = payload.email;
    }

    // Проверяем и обновляем phoneNumber, если он предоставлен и отличается от текущего
    if (payload?.phoneNumber && payload.phoneNumber !== userModel.phoneNumber) {
      if (
        await this.isFieldTakenByAnotherUser(
          payload.phoneNumber,
          'phoneNumber',
          userModel.id,
        )
      ) {
        throw new HttpException(
          'User with this phone number already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      userModel.phoneNumber = payload.phoneNumber;
    }

    // Обновляем пароль, если он предоставлен
    if (payload?.password) {
      const hashPassword = await bcrypt.hash(payload.password, 5);
      userModel.password = hashPassword;
    }

    // Обновляем fullName, если он предоставлен
    if (payload?.fullName) {
      userModel.fullName = payload.fullName;
    }

    await userModel.save();
    return userModel;
  }

  async getAllUsers(
    page = 1,
    limit = 10,
    search = '',
    sort = 'fullName',
    order = 'asc',
  ) {
    const offset = (page - 1) * limit;

    const sortParam = sort === 'date' ? 'createdAt' : sort;

    const where = search
      ? {
          [Op.or]: [
            { fullName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { phoneNumber: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { rows: users, count: totalUsers } =
      await this.userRepository.findAndCountAll({
        where,
        limit: +limit,
        offset,
        order: sort ? [[sortParam, order.toUpperCase()]] : [],
        include: { all: true },
        attributes: { exclude: ['password'] },
      });

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      items: users,
      totalRecords: totalUsers,
      totalPages,
      page: Number(page),
    };
  }

  async getUserByFieldName(
    fieldValue: string | number,
    fieldName: string,
    withPassword: boolean = false,
  ) {
    const where = {
      [fieldName]: fieldValue,
    };

    /* 
            include: { all: true } для поиска всех значений,
            в том числе по ForeignKey в промежуточной базе данных
            в данном случае ролей
        */

    const user = await this.userRepository.findOne({
      where,
      include: { all: true },
      attributes: { exclude: withPassword ? [] : ['password'] },
    });

    return user;
  }

  private async isFieldTakenByAnotherUser(
    value: string,
    fieldName: string,
    currentUserId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        [fieldName]: value,
        id: { [Op.not]: currentUserId }, // Correct usage of Op.not for excluding the current user ID
      },
    });
    return !!user;
  }
}
