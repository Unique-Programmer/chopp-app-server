import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from './subscription.model';
import { NotificationService } from 'src/websockets/notification/notification.service';

@Injectable()
export class YooKassaWebhookService {
  constructor(
    @InjectModel(Subscription) private readonly subscriptionModel: typeof Subscription,
    private readonly notificationService: NotificationService,
  ) {}

  // Создание новой подписки
  async createSubscription(data: {
    transactionId: string;
    orderId: number;
    status?: string;
  }): Promise<Subscription> {
    return await this.subscriptionModel.create(data);
  }

  // Обновление статуса подписки
  async updateSubscriptionStatus(transactionId: string, status: string): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({
      where: { transactionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Подписка с ID транзакции ${transactionId} не найдена.`);
    }

    subscription.status = status;
    await subscription.save();
  }

  // Удаление подписки
  async removeSubscription(transactionId: string): Promise<void> {
    const subscription = await this.subscriptionModel.findOne({
      where: { transactionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Подписка с ID транзакции ${transactionId} не найдена.`);
    }

    await subscription.destroy();
  }

  // Получение всех активных подписок
  async getActiveSubscriptions(): Promise<Subscription[]> {
    return await this.subscriptionModel.findAll({
      where: { status: 'pending' },
    });
  }
}
