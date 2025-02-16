import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users.model';
import { Chat } from './chats.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'messages' })
export class Message extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Hello! How are you?', description: 'Text of the message' })
  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @ApiProperty({ example: '[1, 2, 3]', description: 'Array of user IDs who read the message' })
  @Column({ type: DataType.ARRAY(DataType.INTEGER), allowNull: false, defaultValue: [] })
  wasReadBy: number[];

  @ForeignKey(() => User)
  @Column({ allowNull: true })
  senderId: number;

  @ForeignKey(() => Chat)
  @Column({ allowNull: true })
  @Column
  chatId: number;
}
