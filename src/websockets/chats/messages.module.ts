import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatsService } from './chats.service';
import { Chat } from './chats.model';
import { UserChats } from './user-chats.model';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/users.model';
import { ActiveSessionModule } from '../active-sessions/active-session.module';
import { WebsocketsModule } from '../websockets.module';
import { MessagesService } from './messages.service';
import { Message } from './messages.model';
import { ChatMessages } from './chat-messages.model';
import { ChatsModule } from './chats.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Chat, Message, UserChats, ChatMessages]),
    RolesModule,
    UsersModule,
    ActiveSessionModule,
    WebsocketsModule,
    forwardRef(() => ChatsModule),
  ],
  providers: [MessagesService, ChatsService],
  exports: [MessagesService],
})
export class MessagesModule {}
