import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.model';
import { User } from 'src/users/users.model';
import { ShoppingCartItem } from 'src/shopping-cart/shopping-cart-item.model';
import { PaymentsModule } from 'src/payment/payments.module';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';
import { OrderItem } from './order-item.model';
import { NotificationModule } from 'src/websockets/notification/notification.module';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { NotificationGateway } from 'src/websockets/notification/notification.gateway';
import { WsJwtMiddleware } from 'src/websockets/middlewares/ws-jwt-middleware';
import { OrderStats } from './order-stats.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderItem, User, ShoppingCart, ShoppingCartItem, OrderStats]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
