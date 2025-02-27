import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles-auth.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { GetOrderAnalyticsDTO } from './dto/analytics.dto';
import { PERIOD } from 'src/shared/enums/period';
import { HttpException, HttpStatus } from '@nestjs/common';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analiticService: AnalyticsService) {}

  @Get()
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiQuery({ name: 'period', enum: PERIOD, required: false, description: 'Период анализа (day, week, month)' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Количество дней для анализа' })
  @ApiQuery({ name: 'startDate', type: String, required: false, description: 'Дата начала анализа (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', type: String, required: false, description: 'Дата окончания анализа (YYYY-MM-DD)' })
  @ApiQuery({ name: 'productsId', type: [Number], required: false, description: 'ID продуктов для аналитики' })
  @ApiOperation({ summary: 'Получение аналитики по заказам' })
  @ApiResponse({
    status: 200,
    description: 'Успешное получение общей аналитики (если productsId пустой)',
    schema: {
      type: 'object',
      example: {
        items: [
          {
            date: '2025-02-17',
            ordersQuantity: 5,
            amount: {
              value: '1500.00',
              currency: 'RUB',
            },
          },
        ],
        summary: {
          totalAmount: {
            value: '1500.00',
            currency: 'RUB',
          },
          minOrderAmount: '200.00',
          maxOrderAmount: '500.00',
          averageOrderAmount: '300.00',
        },
      },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Успешное получение аналитики по продуктам (если productsId не пустой)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          orderDate: '2025-02-21',
          product: {
            price: {
              value: '100.00',
              currency: 'RUB',
            },
            title: 'Product 1',
            quantity: 2,
          },
        },
      },
    },
  })
  async getOrderAnalytics(@Query() query: GetOrderAnalyticsDTO) {
    if (query.productsId) {
      const response = await this.analiticService.getProductAnalytics(query);
      throw new HttpException(response, HttpStatus.ACCEPTED);
    }
    return this.analiticService.getOrderAnalytics(query);
  }
}
