import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './messages.model';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message)
    private messageRepository: typeof Message,
  ) {}

  async createMessage(message: Message, userId: number) {
    const { text = '' } = message;

    const newMessage = await this.messageRepository.create({ text });

    await newMessage.update({ senderId: userId });

    return newMessage;
  }

  async getAllChatMessages(chatId: number) {
    return await this.messageRepository.findAll({
      where: { chatId },
      include: { all: true },
      order: [['createdAt', 'ASC']],
    });
  }
}
