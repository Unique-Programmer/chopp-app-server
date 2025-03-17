import { Module } from '@nestjs/common';
import { SubmitLoginService } from './submit-login.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [SubmitLoginService],
  exports: [SubmitLoginService],
})
export class SubmitLoginModule {}
