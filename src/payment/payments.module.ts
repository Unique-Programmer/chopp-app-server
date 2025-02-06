import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';
import { Order } from 'src/order/order.model';
import { Subscription } from './subscription.model';
import { YooKassaWebhookService } from './yookassa-webhook.service';
import { YooKassaWebhookController } from './yookassa-webhook.controller';
import { OrderItem } from 'src/order/order-item.model';
import { ShoppingCartItem } from 'src/shopping-cart/shopping-cart-item.model';
import { NotificationModule } from 'src/websockets/notification/notification.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => OrderModule),
    SequelizeModule.forFeature([Order, Subscription, OrderItem, ShoppingCart, ShoppingCartItem]),
  ],
  providers: [PaymentsService, YooKassaWebhookService],
  controllers: [PaymentsController, YooKassaWebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
