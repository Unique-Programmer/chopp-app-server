import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AuthModule } from 'src/auth/auth.module';
import { Order } from '../order/order.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../products/product.model';
import { OrderStats } from '../order/order-stats.model';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([Order, Product, OrderStats ])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
