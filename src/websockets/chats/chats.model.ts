import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users.model';
import { UserChats } from './user-chats.model';
import { Message } from './messages.model';
import { ChatMessages } from './chat-messages.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'chats' })
export class Chat extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @ApiProperty({ example: 'uuid', description: 'owner id - foreign key' })
  @Column({ allowNull: true })
  ownerId: number;

  @BelongsToMany(() => Message, () => ChatMessages)
  messages: Message[];

  @BelongsToMany(() => User, () => UserChats)
  users: User[];
}
