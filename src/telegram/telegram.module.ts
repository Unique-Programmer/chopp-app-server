import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [HttpModule, ConfigModule, forwardRef(() => UsersModule)],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
