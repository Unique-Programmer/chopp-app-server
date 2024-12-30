import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { BaseGateway } from '../gateways/base.gateway';
import { WsJwtMiddleware } from '../middlewares/ws-jwt-middleware';
import { ActiveSessionService } from '../active-sessions/active-session.service';

@WebSocketGateway({ cors: true })
export class ChatsGateway extends BaseGateway {
  constructor(
    jwtMiddleware: WsJwtMiddleware,
    activeSessionService: ActiveSessionService,
  ) {
    super(jwtMiddleware, activeSessionService);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    console.log(`Message from user ${user.id}:`, message);
    client.emit('message', { message: 'Message processed' });
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