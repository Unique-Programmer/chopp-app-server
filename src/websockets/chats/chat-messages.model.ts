import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Chat } from './chats.model';
import { Message } from './messages.model';

@Table({ tableName: 'chat_messages', createdAt: false, updatedAt: false })
export class ChatMessages extends Model<ChatMessages> {
  @ApiProperty({ example: '1', description: 'primary key id' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Message)
  @Column
  messageId: number;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;
}
