import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GetOrderAnalyticsDTO } from './dto/analytics.dto';
import { Order } from '../order/order.model';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';
import { AnalyticsQueryResult } from 'src/shared/types';
import { OrderAnalyticsResponseDTO } from './dto/analytics-response.dto';
import { DailyAnalytics } from 'src/shared/types';
import { Product } from '../products/product.model';
import { getCurrentIntervals } from '../shared/utils/analytic-utils';
import { OrderStats } from '../order/order-stats.model';
import { ProductAnalyticsResponse } from 'src/shared/types/analytics';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order) private orderModel: typeof Order,
    @InjectModel(Product) private productModel: typeof Product,
    @InjectModel(OrderStats) private orderStatsModel: typeof OrderStats,
  ) {}

  async getOrderAnalytics(query: GetOrderAnalyticsDTO) {
    const { period, days, startDate, endDate } = query;

    const [dateFrom, dateTo] = getCurrentIntervals(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      days,
      period,
    );

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
    })) as unknown as AnalyticsQueryResult[];

    const response = new OrderAnalyticsResponseDTO();

    response.items = analytics.map(
      (item): DailyAnalytics => ({
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

  async getProductAnalytics(query: GetOrderAnalyticsDTO) {
    const { period, days, startDate, endDate, productsId } = query;

    const [dateFrom, dateTo] = getCurrentIntervals(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      days,
      period,
    );

    const productsName = await this.productModel.findAll({
      where: {
        id: {
          [Op.in]: productsId,
        },
      },
      attributes: ['title'],
      raw: true,
    });

    const analytics = await this.orderStatsModel.findAll({
      where: {
        orderDate: {
          [Op.between]: [dateFrom, dateTo],
        },
        ['product.title']: {
          [Op.in]: productsName.map((product) => product.title),
        },
      },
    });

    const response: ProductAnalyticsResponse[] = analytics.map((item) => ({
      orderDate: item.orderDate,
      product: {
        price: {
          value: item.product.price.value,
          currency: item.product.price.currency,
        },
        title: item.product.title,
        quantity: item.product.quantity,
      },
    }));

    return response;
  }
}
