import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsJwtMiddleware } from '../middlewares/ws-jwt-middleware';
import { ActiveSessionService } from '../active-sessions/active-session.service';
import { WS_MESSAGE_TYPE } from 'src/shared/enums';

@Injectable() // Указываем, что базовый класс поддерживает DI
export abstract class BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtMiddleware: WsJwtMiddleware,
    // private readonly activeSessionService: ActiveSessionService,
  ) {} // DI для JwtMiddleware

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      // Аутентификация пользователя
      const { payload: user, error } = this.jwtMiddleware.validate(client);
      if (error) {
        return client.emit('tokenExpired', {
          type: 'tokenExpired',
          payload: error,
          //     //     type: 'message',
          //     //     message: 'Thank you for your message. We are looking into it.',
          //     //     timeStamp: new Date().valueOf(),
          //     //     payload: { sender: 'support' },
          //     //   });
        })
      }

      client.data.user = user;

      // TODO: can be used if need save sessions
      // await this.activeSessionService.upsertSession(user.id, client.id);

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
        // await this.activeSessionService.removeSession(client.id);
        console.log(`User ${user.id} disconnected (sid: ${client.id})`);
      }
    } catch (error) {
      console.error('Error during disconnection:', error.message);
    }
  }
}
