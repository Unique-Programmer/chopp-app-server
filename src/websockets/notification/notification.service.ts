import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from 'src/roles/roles.model';
import { User } from 'src/users/users.model';
import { WsMessage } from 'src/shared/types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async sendUserNotification<T>({ recipientUserIds, message }: { recipientUserIds: number[]; message: WsMessage<T>; }) {
    await this.notificationGateway.sendNotificationToClients<T>(recipientUserIds, message);
  }

  async sendNotificationToAdmin<T>(message: WsMessage<T>) {
    // Получаем всех пользователей с ролью ADMIN
    //TODO: как-то закэшировать получение id админа чтобы каждый раз не ходить в базу
    const admins = await this.userModel.findAll({
      include: [
        {
          model: Role,
          where: { value: 'ADMIN' }, // Предполагается, что роль администратора — "ADMIN"
        },
      ],
    });

    const adminIds = admins.map((admin) => admin.id);

    // Отправляем уведомления всем администраторам
    await this.notificationGateway.sendNotificationToClients<T>(adminIds, message);
  }
}
