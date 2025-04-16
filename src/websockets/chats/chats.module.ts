import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Chat } from './chats.model';
import { UserChats } from './user-chats.model';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/users.model';
import { ActiveSessionModule } from '../active-sessions/active-session.module';
import { WebsocketsModule } from '../websockets.module';
import { ChatMessages } from './chat-messages.model';
import { Message } from './messages.model';
import { ChatsController } from './chats.controller';
import { MessagesModule } from './messages.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService],
  imports: [
    SequelizeModule.forFeature([User, Chat, UserChats, Message, ChatMessages]),
    RolesModule,
    UsersModule,
    ActiveSessionModule,
    AuthModule,
    WebsocketsModule,
    forwardRef(() => MessagesModule),
  ],
  exports: [ChatsService],
})
export class ChatsModule {}
