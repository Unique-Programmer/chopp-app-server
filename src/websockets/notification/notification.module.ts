import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { WsJwtMiddleware } from '../../middlewares/ws-jwt-middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActiveSession } from '../active-sessions/active-session.model';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
  ],
  providers: [
    NotificationGateway, // Gateway для WebSocket
    NotificationService, // Сервис для работы с уведомлениями
    WsJwtMiddleware, // Middleware для обработки JWT в WebSocket
    JwtService,
  ],
  exports: [
    NotificationService, // Экспортируем NotificationService, чтобы использовать в других модулях
    NotificationGateway,
    WsJwtMiddleware,
  ],
})
export class NotificationModule {}
