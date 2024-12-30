import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsJwtMiddleware } from '../middlewares/ws-jwt-middleware';
import { ActiveSessionService } from '../active-sessions/active-session.service';
import { WS_MESSAGE_TYPE } from '../constants/ws-message-types';

@Injectable() // Указываем, что базовый класс поддерживает DI
export abstract class BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtMiddleware: WsJwtMiddleware,
    private readonly activeSessionService: ActiveSessionService,
  ) {} // DI для JwtMiddleware

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      // Аутентификация пользователя
      const { payload: user, error } = this.jwtMiddleware.validate(client);
      if (error) {
        return client.send({
          type: WS_MESSAGE_TYPE.TOKEN_EXPIRED,
          payload: error,
        });
      }

      client.data.user = user;

      // Обновление или создание записи о сессии
      await this.activeSessionService.upsertSession(user.id, client.id);

      console.log(`User ${user.id} connected with sid ${client.id}`);
    } catch (error) {
      console.error('Connection rejected:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const user = client.data.user;
      if (user) {
        // Удаление записи о сессии
        await this.activeSessionService.removeSession(client.id);
        console.log(`User ${user.id} disconnected (sid: ${client.id})`);
      }
    } catch (error) {
      console.error('Error during disconnection:', error.message);
    }
  }
}