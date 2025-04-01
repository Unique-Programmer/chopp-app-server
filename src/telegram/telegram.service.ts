import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
const axios = require('axios');
const http = require('http');
const https = require('https');



@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly apiUrl: string;
  private codeMap: Record<string, string> = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    // 🛠 Создаём кастомный axios instance с отключённым keep-alive
    const axiosInstance = axios.create({
      httpAgent: new http.Agent({ keepAlive: false }),
      httpsAgent: new https.Agent({ keepAlive: false }),
    });

    this.httpService = new HttpService(axiosInstance);
  }

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    this.logger.log('Telegram bot initializing...');

    if (!this.botToken) {
      this.logger.error('TELEGRAM_BOT_TOKEN not found in .env file');
      return;
    }

    this.startPolling();
    this.logger.log('Telegram bot started successfully');
  }

  private async startPolling() {
    let offset = 0;

    const poll = async () => {
      try {
        const response = await lastValueFrom(
          this.httpService.get(`${this.apiUrl}/getUpdates`, {
            params: {
              offset,
              timeout: 30,
              allowed_updates: JSON.stringify(['message']),
            },
            timeout: 35000, // чуть больше, чтобы не зависало
          }),
        );
    
        const updates = response.data.result;
        if (updates?.length > 0) {
          for (const update of updates) {
            await this.handleUpdate(update);
            offset = update.update_id + 1;
          }
        }
      } catch (error) {
        this.logger.error('Ошибка Telegram polling:', {
          message: error.message,
          code: error.code,
        });
      } finally {
        setTimeout(poll, 1000);
      }
    };
    

    poll();
  }

  async sendCode(phoneNumber: string, code: string): Promise<void> {
    const user = await this.usersService.getUserByFieldName(phoneNumber, 'phoneNumber');

    if (!user.telegramUserId) {
      const userKey = `verification:${phoneNumber}`;
      this.codeMap[userKey] = code;
      this.logger.log('This user has not logged into the bot yet, we are waiting for him');
      return;
    }

    await this.sendMessage(
      user.telegramUserId,
      `🔑 <b>Ваш код подтверждения придет следующим сообщением</b>\n\n⏱️ Код действителен в течение 5 минут.\n\n🔒 <i>Никому не сообщайте этот код в целях безопасности.</i>`,
    );

    await this.sendMessage(user.telegramUserId, `<code>${code}</code>`);
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    await lastValueFrom(
      this.httpService.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    );
  }

  async sendContact(chatId: string, phoneNumber: string): Promise<void> {
    const user = await this.usersService.getUserByFieldName(phoneNumber, 'phoneNumber');
    if (!user) {
      await this.sendMessage(
        chatId,
        '❌ <b>Пользователь не найден!</b>\n\nВозможные причины:\n• Номер телефона еще не внесен в систему\n• Неверный формат номера\n\n📲 Пожалуйста, нажмите "Войти" или добавьте товары в корзину в приложении Chopp [ссылка].',
      );
      return;
    }

    if (user.telegramUserId) {
      await this.sendMessage(
        chatId,
        '⚠️ <b>Внимание!</b>\n\nВы уже привязали этот номер телефона к Telegram.\n\nВаш аккаунт уже готов к использованию.',
      );
      return;
    }

    await user.update({ telegramUserId: chatId });
    await this.sendMessage(
      chatId,
      '🎉 <b>Поздравляем!</b>\n\n📲 Ваш номер телефона успешно привязан к Telegram.\n\n🔐 Теперь вы можете использовать бота для безопасной авторизации в приложении Chopp.',
    );

    if (this.codeMap[`verification:${phoneNumber}`]) {
      const userCode = this.codeMap[`verification:${phoneNumber}`];
      delete this.codeMap[`verification:${phoneNumber}`];
      await this.sendCode(phoneNumber, userCode);
    }
  }

  private async handleUpdate(update: any): Promise<void> {
    if (update.message?.contact) {
      const chatId = update.message.chat.id.toString();
      const phoneNumber = update.message.contact.phone_number;
      await lastValueFrom(
        this.httpService.post(`${this.apiUrl}/sendMessage`, {
          chat_id: chatId,
          text: 'Обрабатываю ваш номер телефона...',
          reply_markup: {
            remove_keyboard: true,
          },
        }),
      );

      await this.sendContact(chatId, phoneNumber);
    }

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text;

      if (text === '/start') {
        await this.sendMessage(
          chatId,
          '👋 <b>Приветствую!</b>\n\n🔐 Я бот для безопасной авторизации в сервисе Chopp.\n\nЧтобы начать, поделитесь своим номером телефона, нажав на кнопку ниже 👇',
        );

        await lastValueFrom(
          this.httpService.post(`${this.apiUrl}/sendMessage`, {
            chat_id: chatId,
            text: '📱 Поделитесь вашим номером телефона\n\nЭто необходимо для привязки аккаунта и безопасной авторизации в приложении Chopp.',
            reply_markup: {
              keyboard: [
                [
                  {
                    text: '📱 Поделиться номером телефона',
                    request_contact: true,
                  },
                ],
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }),
        );
      }
    }
  }
}
