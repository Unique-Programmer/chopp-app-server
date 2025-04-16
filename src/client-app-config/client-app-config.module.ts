import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientAppConfig } from './client-app-config.model';
import { ClientAppConfigController } from './client-app-config.controller';
import { ClientAppConfigService } from './client-app-config.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ClientAppConfig]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ClientAppConfigController],
  providers: [ClientAppConfigService],
})
export class ClientAppConfigModule {}
