import { Injectable, Logger, Inject } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SubmitLoginService {
  constructor(
    private readonly telegramService: TelegramService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
    await this.cacheManager.set(`verification:${phoneNumber}`, code, 300); // 5 минут
    await this.telegramService.sendCode(phoneNumber, code);
  }
}
