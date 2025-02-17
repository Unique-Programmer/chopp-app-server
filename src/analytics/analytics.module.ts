import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AuthModule } from 'src/auth/auth.module';
import { Order } from '../order/order.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([Order])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
