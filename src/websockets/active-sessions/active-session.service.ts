import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActiveSession } from './active-session.model';
import { Op } from 'sequelize';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ActiveSessionService {
    private readonly logger = new Logger(ActiveSessionService.name);
    
  constructor(
    @InjectModel(ActiveSession)
    private readonly activeSessionModel: typeof ActiveSession,
  ) {}

  // Добавление или обновление активной сессии
  async upsertSession(userId: number, sid: string): Promise<void> {
    await this.activeSessionModel.upsert({ userId, sid });
  }

  // Удаление активной сессии
  async removeSession(sid: string): Promise<void> {
    console.log('--removeSession: ', sid)
    await this.activeSessionModel.destroy({ where: { sid } });
  }

  // Получение активной сессии
  async getSessionBySid(sid: string): Promise<ActiveSession | null> {
    return this.activeSessionModel.findOne({ where: { sid } });
  }

  // Получение активной сессии по userId
  async getSessionByUserId(userId: number): Promise<ActiveSession | null> {
    return this.activeSessionModel.findOne({ where: { userId } });
  }

  // Получение активных сессий по userIds[]
  async getSessionsByUserIds(userIds: number[]): Promise<ActiveSession[]> {
    return await this.activeSessionModel.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
    });
  }

  async cleanStaleSessions(): Promise<void> {
    const expirationTime = new Date(Date.now() - 3600 * 1000); // Например, 1 час
    await this.activeSessionModel.destroy({
      where: {
        connectedAt: { [Op.lt]: expirationTime },
      },
    });
  }  

  @Cron(CronExpression.EVERY_HOUR) // Используем стандартное выражение
  async handleCleanStaleSessionsCron() {
    this.logger.warn('Running scheduled cleanup for stale websocket sessions...');
    await this.cleanStaleSessions();
  }
}
