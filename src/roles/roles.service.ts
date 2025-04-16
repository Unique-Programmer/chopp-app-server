// src/roles/roles.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    await this.ensureRole(1, 'ADMIN', 'Роль администратора');
    await this.ensureRole(2, 'USER', 'Роль пользвоателя');
  }

  private async ensureRole(id: number, value: string, description: string) {
    const role = await this.roleRepository.findByPk(id);

    if (role?.value === value && role?.id !== id) {
      this.logger.error(
        `❌ Конфликт: роль '${value}' уже существует но с другим ID (${role.id}). ` +
          `Ожидаемый ID: ${id}.`,
      );
      return;
    }

    if (!role) {
      try {
        await this.roleRepository.create({ id, value, description });
        this.logger.log(`🚀 Создана дефолтная ROLE: ${value} с ID ${id}`);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          this.logger.error(
            `❌ Ошибка уникальности: Невозможно создать роль с значением '${value}' ` +
              `потому что такое значение уже существует.`,
          );
        } else {
          this.logger.error(`❌ Ошибка при создании роли: ${error.message}`);
        }
      }
    }
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { value: dto.value },
    });
    if (existingRole) {
      throw new HttpException('Role already exists', HttpStatus.BAD_REQUEST);
    }
    return this.roleRepository.create(dto);
  }

  async getRoleByValue(value: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { value } });
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    return role;
  }
}
