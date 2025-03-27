import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtMiddleware } from '../middlewares/ws-jwt-middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActiveSession } from './active-sessions/active-session.model';
import { ActiveSessionModule } from './active-sessions/active-session.module';
import { NotificationGateway } from './notification/notification.gateway';

@Module({
  imports: [SequelizeModule.forFeature([ActiveSession]), ActiveSessionModule],
  providers: [NotificationGateway, WsJwtMiddleware, JwtService],
  exports: [WsJwtMiddleware],
})
export class WebsocketsModule {}