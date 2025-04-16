import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/users.model';

@Table({ tableName: 'active_ws_sessions' })
export class ActiveSession extends Model<ActiveSession> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  sid: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  connectedAt: Date;
}
