import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GetOrderAnalyticsDTO } from './dto/analytics.dto';
import { Order } from '../order/order.model';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';
import { IAnalyticsQueryResult } from 'src/shared/types';
import { PeriodEnum } from 'src/shared/enums/period';
import { OrderAnalyticsResponseDTO } from './dto/analytics-response.dto';
import { IDailyAnalytics } from 'src/shared/types';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Order) private orderModel: typeof Order) {}

  async getOrderAnalytics(query: GetOrderAnalyticsDTO) {
    const { period, days, startDate, endDate } = query;

    let dateFrom: Date;
    let dateTo: Date = new Date();

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
    } else if (days) {
      dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - days);
    } else if (period) {
      dateFrom = new Date();
      switch (period) {
        case PeriodEnum.DAY:
          dateFrom.setDate(dateFrom.getDate() - 1);
          break;
        case PeriodEnum.WEEK:
          dateFrom.setDate(dateFrom.getDate() - 7);
          break;
        case PeriodEnum.MONTH:
          dateFrom.setDate(dateFrom.getDate() - 30);
          break;
      }
    } else {
      dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - 1);
    }

    const analytics = (await this.orderModel.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orders'],
        [Sequelize.fn('SUM', Sequelize.col('totalPrice')), 'amount'],
        [Sequelize.fn('MIN', Sequelize.col('totalPrice')), 'minAmount'],
        [Sequelize.fn('MAX', Sequelize.col('totalPrice')), 'maxAmount'],
        [Sequelize.fn('AVG', Sequelize.col('totalPrice')), 'avgAmount'],
      ],
      where: {
        createdAt: {
          [Op.between]: [dateFrom, dateTo],
        },
      },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true,
    })) as unknown as IAnalyticsQueryResult[];

    const response = new OrderAnalyticsResponseDTO();

    response.items = analytics.map(
      (item): IDailyAnalytics => ({
        date: item.date,
        ordersQuantity: Number(item.orders),
        amount: {
          value: (item.amount || 0).toFixed(2),
          currency: 'RUB',
        },
      }),
    );

    const totalAmount = analytics.reduce((acc, item) => acc + (item.amount || 0), 0);
    const totalOrders = analytics.reduce((acc, item) => acc + item.orders, 0) || 1;
    const minOrderAmount = analytics.length > 0 ? Math.min(...analytics.map((item) => item.minAmount)) : 0;
    const maxOrderAmount = analytics.length > 0 ? Math.max(...analytics.map((item) => item.maxAmount)) : 0;

    response.summary = {
      totalAmount: {
        value: totalAmount.toFixed(2),
        currency: 'RUB',
      },
      minOrderAmount: minOrderAmount.toFixed(2),
      maxOrderAmount: maxOrderAmount.toFixed(2),
      averageOrderAmount: Math.round(totalAmount / totalOrders).toFixed(2),
    };

    return response;
  }
}
