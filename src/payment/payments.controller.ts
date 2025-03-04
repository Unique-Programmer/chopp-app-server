import { Controller, UseGuards, Get, Query, Param, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRefundDto } from 'src/order/dto/create-refund.dto';
import { GetPaymentResponseDto } from 'src/order/dto/get-payment-response.dto';
import { GetRefundResponseDto } from 'src/order/dto/get-refund-response.dto';
import { OrderService } from 'src/order/order.service';
import { PaymentsService } from './payments.service';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles-auth.guard';
import { CreatePaymentResponseDto } from './dto/create-payment-response.dto';
import { CapturePaymentDto } from './dto/capture-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('/orders/:orderId/pay')
  @ApiOperation({ summary: 'Оплатить заказ' })
  @ApiParam({
    name: 'orderId',
    required: true,
    type: Number,
    description: 'Идентификатор заказа',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        returnUrl: {
          type: 'string',
          description: 'URL, на который будет перенаправлен пользователь после оплаты',
          example: 'https://yourfrontend.com/order-confirmation/123',
        },
      },
      required: ['returnUrl'],
    },
  })
  async payForOrder(@Param('orderId') orderId: number, @Body() { returnUrl }: { returnUrl: string }): Promise<any> {
    return this.paymentService.payForOrder({ orderId, returnUrl });
  }

  @Get('')
  @ApiOperation({ summary: 'Получить список платежей' })
  @ApiResponse({
    status: 200,
    description: 'Список платежей успешно получен',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Ограничение количества возвращаемых платежей',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Курсор для пагинации',
  })
  @ApiQuery({
    name: 'created_at.gte',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: больше или равно',
  })
  @ApiQuery({
    name: 'created_at.gt',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: строго больше',
  })
  @ApiQuery({
    name: 'created_at.lte',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: меньше или равно',
  })
  @ApiQuery({
    name: 'created_at.lt',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: строго меньше',
  })
  @ApiQuery({
    name: 'captured_at.gte',
    required: false,
    type: String,
    description: 'Фильтр по времени подтверждения платежей: больше или равно',
  })
  @ApiQuery({
    name: 'captured_at.gt',
    required: false,
    type: String,
    description: 'Фильтр по времени подтверждения платежей: строго больше',
  })
  @ApiQuery({
    name: 'captured_at.lte',
    required: false,
    type: String,
    description: 'Фильтр по времени подтверждения платежей: меньше или равно',
  })
  @ApiQuery({
    name: 'captured_at.lt',
    required: false,
    type: String,
    description: 'Фильтр по времени подтверждения платежей: строго меньше',
  })
  @ApiQuery({
    name: 'payment_method',
    required: false,
    type: String,
    description: 'Фильтр по коду способа оплаты',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Фильтр по статусу платежа',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Поиск по номеру заказа или транзакции',
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getPayments(
    @Query()
    queryParams: {
      limit?: number;
      cursor?: string;
      'created_at.gte'?: string;
      'created_at.gt'?: string;
      'created_at.lte'?: string;
      'created_at.lt'?: string;
      'captured_at.gte'?: string;
      'captured_at.gt'?: string;
      'captured_at.lte'?: string;
      'captured_at.lt'?: string;
      payment_method?: string;
      status?: string;
      search?: string;
    },
  ): Promise<any> {
    console.log('--queryParams; ', queryParams);
    return this.paymentService.getPayments(queryParams);
  }

  @Get('/:paymentId')
  @ApiOperation({
    summary: 'Получить подробную информацию о конкретном платеже',
  })
  @ApiResponse({
    status: 200,
    description: 'Подробная информация о платеже успешно получена',
    type: GetPaymentResponseDto,
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getPayment(@Param('paymentId') paymentId: string): Promise<GetPaymentResponseDto> {
    const paymentDetails = await this.paymentService.getPaymentById(paymentId);
    return { payment: paymentDetails }; // Оберните результат в объект для соответствия DTO
  }

  @Post('/:paymentId/capture')
  @ApiOperation({ summary: 'Подтвердить платеж' })
  @ApiResponse({ status: 200, description: 'Платеж успешно подтвержден' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async capturePayment(@Param('paymentId') paymentId: string, @Body() captureDto: CapturePaymentDto) {
    return await this.paymentService.capturePayment(paymentId, captureDto);
  }

  @Post('/:paymentId/cancel')
  @ApiOperation({
    summary: 'Отменить платеж, находящийся в статусе waiting_for_capture',
  })
  @ApiResponse({
    status: 200,
    description: 'Платеж успешно отменен',
    type: 'any', // Указать конкретный тип, если необходимо
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async cancelPayment(@Param('paymentId') paymentId: string) {
    return await this.paymentService.cancelPayment(paymentId);
  }

  @Post('/refund')
  @ApiOperation({ summary: 'Создание возврата' })
  @ApiResponse({
    status: 201,
    description: 'Возврат успешно создан',
    type: GetRefundResponseDto,
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  createRefund(@Body() createRefundDto: CreateRefundDto): Promise<GetRefundResponseDto> {
    return this.paymentService.createRefund(createRefundDto);
  }

  @Get('/refunds')
  @ApiOperation({ summary: 'Получение списка возвратов' })
  @ApiResponse({ status: 200, description: 'Список возвратов получен' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Ограничение количества возвращаемых возвратов',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Курсор для пагинации',
  })
  @ApiQuery({
    name: 'created_at_gte',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: больше или равно',
  })
  @ApiQuery({
    name: 'created_at_gt',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: строго больше',
  })
  @ApiQuery({
    name: 'created_at_lte',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: меньше или равно',
  })
  @ApiQuery({
    name: 'created_at_lt',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: строго меньше',
  })
  @ApiQuery({
    name: 'payment_id',
    required: false,
    type: String,
    description: 'Фильтр по идентификатору платежа',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Фильтр по статусу возврата',
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getRefunds(
    @Query()
    queryParams: {
      limit?: number;
      cursor?: string;
      created_at_gte?: string;
      created_at_gt?: string;
      created_at_lte?: string;
      created_at_lt?: string;
      payment_id?: string;
      status?: string;
    },
  ): Promise<any> {
    return this.paymentService.getRefunds(queryParams);
  }

  @Get('/refund/:refundId')
  @ApiOperation({ summary: 'Получение информации о возврате' })
  @ApiResponse({
    status: 200,
    description: 'Информация о возврате',
    type: GetRefundResponseDto,
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getRefundById(@Param('refundId') refundId: string): Promise<GetRefundResponseDto> {
    return this.paymentService.getRefundById(refundId);
  }

  @Get('/receipts')
  @ApiOperation({ summary: 'Получить список чеков' })
  @ApiResponse({
    status: 200,
    description: 'Список чеков успешно получен',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Ограничение количества возвращаемых чеков',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Курсор для пагинации',
  })
  @ApiQuery({
    name: 'created_at_gte',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: больше или равно',
  })
  @ApiQuery({
    name: 'created_at_gt',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: строго больше',
  })
  @ApiQuery({
    name: 'created_at_lte',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: меньше или равно',
  })
  @ApiQuery({
    name: 'created_at_lt',
    required: false,
    type: String,
    description: 'Фильтр по времени создания: строго меньше',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Фильтр по статусу чека',
  })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getReceipts(
    @Query()
    queryParams: {
      limit?: number;
      cursor?: string;
      created_at_gte?: string;
      created_at_gt?: string;
      created_at_lte?: string;
      created_at_lt?: string;
      status?: string;
    },
  ): Promise<any> {
    return this.paymentService.getReceipts(queryParams);
  }
}
