import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { RolesModule } from 'src/roles/roles.module';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    SequelizeModule.forFeature([User, Role, UserRoles, ShoppingCart]),
    RolesModule,
    forwardRef(() => AuthModule),
    forwardRef(() => TelegramModule),
  ],
  exports: [UsersService],
})
export class UsersModule {}
