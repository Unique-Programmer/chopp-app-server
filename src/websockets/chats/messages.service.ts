import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './messages.model';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message)
    private messageRepository: typeof Message,
  ) {}

  async createMessage(message: Message, userId: number) {
    const { text = '' } = message;

    const newMessage = await this.messageRepository.create({ text, senderId: userId });

    await this.markMessageAsRead(newMessage.id, userId);

    return newMessage;
  }

  async getAllChatMessages(chatId: number) {
    return await this.messageRepository.findAll({
      where: { chatId },
      include: { all: true },
      order: [['createdAt', 'ASC']],
    });
  }

  async markAllMessagesAsRead(chatId: number, userId: number) {
    await this.messageRepository.update(
      {
        wasReadBy: Sequelize.literal(`ARRAY_APPEND("wasReadBy", ${userId})`)
      },
      {
        where: Sequelize.literal(`"chatId" = ${chatId} AND NOT (${userId} = ANY("wasReadBy"))`)
      }
    );
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<Message> {
    const message = await this.messageRepository.findByPk(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (!message.wasReadBy.includes(userId)) {
      message.wasReadBy = [...message.wasReadBy, userId];
      await message.save();
    }

    return message;
  }
}
