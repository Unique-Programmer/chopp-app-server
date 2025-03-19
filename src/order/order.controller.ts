import { Body, Controller, Post, UseGuards, Req, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderService } from './order.service';
import { PaymentsService } from 'src/payment/payments.service';
import { GetOrdersResponseDto } from './dto/get-orders-response.dto';
import { PaginationResponse } from 'src/shared/types/pagination-response';
import { Order } from './order.model';
import { CreatePaymentResponseDto } from 'src/payment/dto/create-payment-response.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles-auth.guard';
import { CreateOrderDTO } from './dto/create-order.dto';
import { ORDER_STATUS } from 'src/shared/enums';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый заказ и инициировать платеж' })
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно создан, и платеж инициирован',
    type: CreatePaymentResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        returnUrl: {
          type: 'string',
          description: 'URL, на который будет перенаправлен пользователь после оплаты',
          example: 'https://yourfrontend.com/order-confirmation/123',
        },
        address: {
          type: 'string',
          description: 'Адрес доставки',
          example: 'ул. Толстых',
        },
        comment: {
          type: 'string',
          description: 'Комментарий',
          example: 'Не стучите, звоните',
        },
        name: {
          type: 'string',
          description: 'Имя получателя',
          example: 'Иван Пупкин',
        },
        phoneNumber: {
          type: 'string',
          description: 'Телефон поолучателя',
          example: '8888888888',
        },
        
      },
      required: ['returnUrl'],
    },
  })
  async createOrder(@Req() req: any, @Body() body: CreateOrderDTO): Promise<CreatePaymentResponseDto> {
    return this.orderService.createOrder({ userId: req.user.id, ...body });
  }

  @Post('/update-order-payment-status')
  @ApiOperation({ summary: 'Обновить статус платежа и заказа' })
  @ApiResponse({ status: 200, description: 'Статус платежа и заказа успешно обновлен.' })
  @ApiResponse({ status: 404, description: 'Заказ не найден.' })
  @ApiBody({ type: UpdatePaymentStatusDto }) // Указываем DTO с enum'ами
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async updatePaymentStatus(@Body() updateDto: UpdatePaymentStatusDto): Promise<Order> {
    return this.orderService.updateOrderPaymentStatus(updateDto);
  }

  @Get('/lastOrder')
  @ApiOperation({ summary: 'Получить последний по дате заказ пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Текущий заказ успешно получен.',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Заказы пользователя не найдены.' })
  async getCurrentOrder(@Req() req: any): Promise<Order> {
    const userId = req.user.id;
    return this.orderService.findLastOrder(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список заказов' })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Количество заказов на странице',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
    description: 'Поиск по ID заказа',
    example: '12345',
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    required: false,
    description: 'Фильтр по дате создания заказа (начальная дата, формат YYYY-MM-DD)',
    example: '2024-03-01',
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    required: false,
    description: 'Фильтр по дате создания заказа (конечная дата, формат YYYY-MM-DD)',
    example: '2024-03-15',
  })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: false,
    description: 'Список статусов заказов, через запятую',
    example: 'AWAITING_PAYMENT,DELIVERED',
  })
  @ApiQuery({
    name: 'sort',
    type: 'string',
    required: false,
    description: 'Ключ сортировки',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'order',
    type: 'string',
    required: false,
    description: 'Порядок сортировки',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @ApiResponse({
    status: 200,
    description: 'Список заказов успешно получен',
    type: [GetOrdersResponseDto],
  })
  async getAllOrders(
    @Req() req: any, // Первый аргумент
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: ORDER_STATUS,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<PaginationResponse<Order>> {
    const userId = req.user.id;
    const isAdmin = req.user.roles.some((role: any) =>
      typeof role === 'string' ? role === 'ADMIN' : role.value === 'ADMIN',
    );

    return this.orderService.findAllOrders({
      page,
      limit,
      search,
      startDate,
      endDate,
      status: status ? status.split(',') as ORDER_STATUS[] : undefined, // Преобразуем строку в массив статусов
      sort,
      order,
      userId: isAdmin ? undefined : userId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiResponse({
    status: 200,
    description: 'Данные заказа успешно получены.',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Заказ не найден.' })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOneOrder(id);
  }
}
