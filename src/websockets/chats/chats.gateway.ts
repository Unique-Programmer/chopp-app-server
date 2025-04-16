import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { BaseGateway } from '../gateways/base.gateway';
import { WsJwtMiddleware } from '../../middlewares/ws-jwt-middleware';
import { ChatsService } from './chats.service';
import { Message } from './messages.model';
import { Server } from 'socket.io';
import { ActiveSocket } from 'src/shared/types';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class ChatsGateway extends BaseGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    jwtMiddleware: WsJwtMiddleware,
    private chatsService: ChatsService,
    private messagesService: MessagesService,
  ) {
    super(jwtMiddleware);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: Message,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) return;
    console.log(` ------ Message from user ${user.id}:`, message);
    // TODO: just for testing
    // socket.emit('message', { message: 'Message processed' });

    const activeSockets = Array.from(this.server.sockets.sockets.values());
    const activeSessions: ActiveSocket[] = activeSockets.map((socket) => ({
      socketId: socket?.id,
      userId: socket?.data?.user?.id,
    }));

    this.chatsService.handleMessage(socket, activeSessions, message, user.id);
  }

  @SubscribeMessage('messagesRead')
  handleMessagesRead(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    if (!user) return;

    this.messagesService.markAllMessagesAsRead(Number(data.chatId), user.id);
  }
}

// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Socket } from 'socket.io';
// import { ChatService } from './chats.service';

// @WebSocketGateway({ cors: true })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   constructor(private readonly chatService: ChatService) {}

//   // При подключении клиента
//   handleConnection(client: Socket) {
//     //   console.log('Client connected:', client.id);
//     client.emit('connection', {
//       type: 'connection2',
//       message: 'Connection successful',
//     });
//   }

//   // При отключении клиента
//   handleDisconnect(client: Socket) {
//     //   console.log('Client disconnected:', client.id);
//     client.emit('disconnection', {
//       type: 'disconnection',
//       message: 'Disconnected',
//       timeStamp: new Date().valueOf(),
//     });
//   }

//   // Обработка события "message"
//   @SubscribeMessage('message')
//   async handleMessage(
//     @MessageBody() message: any,
//     @ConnectedSocket() client: Socket,
//   ) {
//     console.log('Message received:', message);

//     // // Ответ на начало ввода
//     // client.emit('typingStarted', {
//     //   code: 'typingStarted',
//     //   message: message.message,
//     //   timeStamp: message.timeStamp,
//     //   type: 'typing',
//     // });

//     // // Ответ на окончание ввода через 2 секунды
//     // setTimeout(() => {
//     //   client.emit('typingStopped', {
//     //     code: 'typingStopped',
//     //     message: message.message,
//     //     timeStamp: message.timeStamp,
//     //     type: 'typing',
//     //   });
//     // }, 2000);

//     // // Отправка окончательного ответа через 4 секунды
//     // setTimeout(() => {
//     //   client.emit('message', {
//     //     type: 'message',
//     //     message: 'Thank you for your message. We are looking into it.',
//     //     timeStamp: new Date().valueOf(),
//     //     payload: { sender: 'support' },
//     //   });
//     // }, 4000);

//     client.emit('message', {
//       type: 'message',
//       message: 'Thank you for your message. We are looking into it.',
//       timeStamp: new Date().valueOf(),
//       payload: { sender: 'support' },
//     });
//   }

//   // Обработка получения истории чата
//   @SubscribeMessage('chatHistory')
//   async handleChatHistory(
//     @MessageBody() message: any,
//     @ConnectedSocket() client: Socket,
//   ) {
//     if (message.code === 'getHistory') {
//       const chatHistory = await this.chatService.getChatHistory(message.chatId);
//       client.emit('chatHistory', {
//         type: 'chatHistory',
//         payload: chatHistory,
//         timestamp: new Date().valueOf(),
//       });
//     }
//   }

//   // Обработка статуса звонка
//   @SubscribeMessage('callStatus')
//   async handleCallStatus(
//     @MessageBody() message: any,
//     @ConnectedSocket() client: Socket,
//   ) {
//     if (message.code === 'call') {
//       client.emit('callStatus', {
//         type: 'callStatus',
//         message: 'processing',
//         timeStamp: new Date().valueOf(),
//       });

//       setTimeout(() => {
//         client.emit('callStatus', {
//           type: 'callStatus',
//           message: 'accepted',
//           timeStamp: new Date().valueOf(),
//         });
//       }, 1000);

//       setTimeout(() => {
//         client.emit('callStatus', {
//           type: 'callStatus',
//           message: 'onTheWay',
//           timeStamp: new Date().valueOf(),
//         });
//       }, 3000);

//       setTimeout(() => {
//         client.emit('callStatus', {
//           type: 'callStatus',
//           message: 'onTheSpot',
//           timeStamp: new Date().valueOf(),
//         });
//       }, 5000);

//       setTimeout(() => {
//         client.emit('callStatus', {
//           type: 'callStatus',
//           message: 'completed',
//           timeStamp: new Date().valueOf(),
//         });
//       }, 7000);
//     } else if (message.code === 'getCallStatus') {
//       client.emit('callStatus', {
//         type: 'callStatus',
//         message: 'idle',
//         timeStamp: new Date().valueOf(),
//       });
//     }
//   }
// }
