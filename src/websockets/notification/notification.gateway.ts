import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtMiddleware } from '../../middlewares/ws-jwt-middleware';
import { BaseGateway } from '../gateways/base.gateway';
import { WsMessage } from 'src/shared/types';

@WebSocketGateway({ cors: true })
export class NotificationGateway extends BaseGateway  {
  @WebSocketServer()
  private server: Server;

  constructor(
    jwtMiddleware: WsJwtMiddleware,
  ) {
    super(jwtMiddleware);
  }

  // Метод для отправки уведомления
  async sendNotificationToClients<T>(
    recipientUserIds: number[], // Массив userId, которым нужно отправить уведомления
    message: WsMessage<T>, // Сообщение для отправки
  ) {
    console.log('----sendNotificationToClients: ', recipientUserIds)
    const activeSockets = Array.from(this.server.sockets.sockets.values());
    const activeSessions = activeSockets.map((socket: Socket) => ({
      socketId: socket?.id,
      userId: socket?.data?.user?.id,
    }));

    // Фильтруем активные сессии по userId
    const recipientSessions = activeSessions.filter((session) =>
      recipientUserIds.includes(session.userId),
    );

    // Отправляем уведомления соответствующим сокетам
    for (const session of recipientSessions) {
      this.server.to(session.socketId).emit('notification', message);
    }
  }
}
