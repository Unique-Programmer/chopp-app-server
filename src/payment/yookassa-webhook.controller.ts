import { Controller, Post, Body } from '@nestjs/common';
import { YooKassaWebhookService } from './yookassa-webhook.service';
import { OrderService } from 'src/order/order.service';
import { ORDER_STATUS, PAYMENT_STATUS } from 'src/shared/enums';

@Controller('yookassa/webhook')
export class YooKassaWebhookController {
  constructor(
    private readonly subscriptionService: YooKassaWebhookService,
    private readonly orderService: OrderService, // Инжектируем OrderService
  ) {}

  @Post()
  async handleWebhook(@Body() payload: any): Promise<{ status: string }> {
    const { event, object } = payload;

    switch (event) {
      case 'payment.succeeded':
        await this.orderService.updateOrderPaymentStatus({
          transactionId: object.id,
          orderStatus: ORDER_STATUS.PAYMENT_SUCCEEDED,
          paymentStatus: PAYMENT_STATUS.SUCCEEDED,
        });
        await this.subscriptionService.updateSubscriptionStatus(object.id, 'succeeded');
        await this.subscriptionService.removeSubscription(object.id);
        break;

      case 'payment.canceled':
        await this.orderService.updateOrderPaymentStatus({
          transactionId: object.id,
          orderStatus: ORDER_STATUS.PAYMENT_CANCELED,
          paymentStatus: PAYMENT_STATUS.CANCELED,
        });
        await this.subscriptionService.updateSubscriptionStatus(object.id, 'canceled');
        await this.subscriptionService.removeSubscription(object.id);
        break;

      default:
        console.warn(`Необработанное событие: ${event}`);
    }

    return { status: 'ok' };
  }
}
