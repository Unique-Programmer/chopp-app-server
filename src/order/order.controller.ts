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
import { CreateOrderDTO} from './dto/create-order.dto'

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
    description: 'Поиск по деталям заказа',
    example: '',
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('sort') sort: string = 'createdAt',
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Req() req: any,
  ): Promise<PaginationResponse<Order>> {
    const userId = req.user.id;
    const isAdmin = req.user.roles.some((role: any) =>
      typeof role === 'string' ? role === 'ADMIN' : role.value === 'ADMIN',
    );

    return this.orderService.findAllOrders({
      page,
      limit,
      search,
      sort,
      order,
      userId: isAdmin ? undefined : userId, // Если админ, возвращаем все заказы, иначе только для текущего пользователя
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
