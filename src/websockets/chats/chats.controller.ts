import { Body, Controller, Get, Post, UnauthorizedException, UseGuards, Headers, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { Chat } from './chats.model';
import { CreateChatDto } from './dto/create-chat.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { MessagesService } from './messages.service';
import { Message } from './messages.model';
import { ChatStatsDto } from './dto/chat-stats.dto';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(
    private chatsService: ChatsService,
    private authService: AuthService,
    private usersService: UsersService,
    private messageService: MessagesService,
) {}

  @ApiOperation({ summary: 'Role creation' })
  @ApiResponse({ status: 200, type: Chat })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createChatDto: CreateChatDto) {
    const user = await this.usersService.getUserByFieldName(createChatDto.ownerId, 'id');
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid user' });
    }

    const newChat = await this.chatsService.createChat(user);
    this.chatsService.joinUserToChat(newChat.id, createChatDto.userId);

    return newChat;
  }

  @ApiOperation({ summary: 'Getting all chats by user id from accessToken in auth header' })
  @ApiResponse({ status: 200, type: [Chat] })
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllChats(@Headers() headers) {
    const authHeader = headers.authorization;
    const accessToken = authHeader.split(' ')[1];

    const payload = this.authService.verifyToken(
      accessToken,
      process.env.JWT_ACCESS_SECRET_HEX,
    );

    return this.chatsService.getAllChats(payload.id);
  }

  @ApiOperation({ summary: 'Getting chat messages by chat id param' })
  @ApiResponse({ status: 200, type: [Message] })
  @UseGuards(JwtAuthGuard)
  @Get('/:id/messages')
  getAllChatMessages(@Param() params) {
    const { id } = params;
    return this.messageService.getAllChatMessages(id);
  }

  @ApiOperation({ summary: "Getting chat messages for USER's app with one chat" })
  @ApiResponse({ status: 200, type: [Chat] })
  @UseGuards(JwtAuthGuard)
  @Get('/currentUserMessages')
  async getCurrentUserMessages(@Headers() headers) {
    const authHeader = headers.authorization;
    const accessToken = authHeader.split(' ')[1];

    const payload = this.authService.verifyToken(
      accessToken,
      process.env.JWT_ACCESS_SECRET_HEX,
    );

    const chat = await this.chatsService.getAllChatMessagesByUserId(payload.id);

    if (chat) {
      return await this.messageService.getAllChatMessages(chat.id);
    } else { 
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getUserChatStats(@Req() req): Promise<ChatStatsDto> {
    //TODO: do the same user token parcing in all places
    const userId = req.user.id;
    return this.chatsService.getUserChatStats(userId);
  }
}
