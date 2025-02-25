import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { CreateOrderDTO } from './dto/create-order.dto';
import { ORDER_STATUS, PAYMENT_STATUS, WS_MESSAGE_TYPE } from 'src/shared/enums';
import { CreatePaymentResponseDto } from '../payment/dto/create-payment-response.dto';
import { ShoppingCartItem } from 'src/shopping-cart/shopping-cart-item.model';
import { Op } from 'sequelize';
import { PaymentsService } from 'src/payment/payments.service';
import { ShoppingCart } from 'src/shopping-cart/shopping-cart.model';
import { OrderItem } from './order-item.model';
import { Product } from 'src/products/product.model';
import { PaginationResponse } from 'src/shared/types/pagination-response';
import { PaginationRequestQuery } from 'src/shared/types';
import { Category } from 'src/categories/category.model';
import { FileModel } from 'src/files/file.model';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { User } from 'src/users/users.model';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(ShoppingCart) private readonly shoppingCartModel: typeof ShoppingCart,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(ShoppingCartItem) private readonly shoppingCartItemModel: typeof ShoppingCartItem,
    private readonly paymentService: PaymentsService,
    private readonly notificationService: NotificationService,
  ) {}

  private async findLastOrderRaw(userId: number): Promise<Order | null> {
    return this.orderModel.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  private async getCart(userId: number, transaction: any): Promise<ShoppingCart> {
    const cart = await this.shoppingCartModel.findOne({
      where: { userId },
      include: [{ model: ShoppingCartItem, include: [{ model: Product }] }],
      transaction,
    });

    if (!cart || !cart.items.length) {
      throw new NotFoundException('Корзина пуста или не найдена. Добавьте товары перед оформлением заказа.');
    }

    return cart;
  }

  private async createOrderItems(orderId: number, items: ShoppingCartItem[], transaction: any): Promise<void> {
    for (const item of items) {
      await this.orderItemModel.create(
        {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        },
        { transaction },
      );
    }
  }

  async createOrder({
    userId,
    returnUrl,
    comment,
    address,
  }: { userId: number } & CreateOrderDTO): Promise<CreatePaymentResponseDto> {
    const transaction = await this.orderModel.sequelize.transaction();

    try {
      const lastOrder = await this.findLastOrderRaw(userId);
      if (lastOrder && lastOrder.orderStatus !== ORDER_STATUS.DELIVERED) {
        throw new Error('Дождитесь завершения предыдущего заказа.');
      }

      const cart = await this.getCart(userId, transaction);

      const order = await this.orderModel.create(
        {
          userId,
          totalPrice: cart.totalPrice,
          quantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          orderStatus: ORDER_STATUS.AWAITING_PAYMENT,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        { transaction },
      );

      await this.createOrderItems(order.id, cart.items, transaction);
      const user = await this.userModel.findByPk(userId, { transaction });

      const items = await this.orderItemModel.findAll({
        where: { orderId: order.id },
        include: [{ model: Product }],
        transaction,
      });

      const paymentResult = await this.paymentService.createPayment({
        amount: order.totalPrice.toString(),
        currency: 'RUB',
        description: `Оплата за заказ ${order.id}`,
        returnUrl, // Используем переданный returnUrl
        metadata: { order_id: order.id },
        user,
        items,
      });

      order.transactionId = paymentResult.id;
      order.paymentStatus = PAYMENT_STATUS.PENDING;
      order.paymentUrl = paymentResult.confirmation.confirmation_url;
      order.comment = comment;
      order.address = address;

      await order.save({ transaction });
      await this.shoppingCartItemModel.destroy({ where: { shoppingCartId: cart.id }, transaction });
      await cart.update({ totalPrice: 0, quantity: 0 }, { transaction });
      await transaction.commit();

      await this.notificationService.sendNotificationToAdmin<Order>({
        type: WS_MESSAGE_TYPE.NEW_ORDER,
        payload: order,
      });

      await this.notificationService.sendUserNotification<Order>({
        recipientUserIds: [user.id],
        message: {
          type: WS_MESSAGE_TYPE.NEW_ORDER,
          payload: order,
        },
      });

      return order.toJSON() as CreatePaymentResponseDto;
    } catch (error) {
      await transaction.rollback();
      throw new NotFoundException(`Ошибка при создании заказа или инициации платежа: ${String(error)}`);
    }
  }

  async findLastOrder(userId: number): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']], // Находим последний заказ
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }, { model: Category }], // Включаем изображения и категорию
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден.');
    }

    // Преобразуем в JSON, чтобы исключить циклические ссылки
    const plainOrder = order.toJSON();

    // Агрегируем информацию о товарах
    const items = plainOrder.items.map((item) => ({
      product: {
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        category: item.product.category?.title || 'Другое',
        images: item.product.images, // Включаем изображения
      },
      quantity: item.quantity,
      totalPrice: item.quantity * item.product.price,
    }));

    return {
      id: plainOrder.id,
      totalPrice: plainOrder.totalPrice,
      quantity: plainOrder.quantity,
      orderStatus: plainOrder.orderStatus,
      paymentStatus: plainOrder.paymentStatus,
      transactionId: plainOrder.transactionId,
      createdAt: plainOrder.createdAt,
      paymentUrl: plainOrder.paymentUrl,
      comment: plainOrder.comment,
      address: plainOrder.address,
      items, // Включаем агрегированные товары
    } as unknown as Order;
  }

  async findAllOrders({
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    sort = 'createdAt',
    order = 'ASC',
    userId,
  }: PaginationRequestQuery & { userId?: number; startDate?: string; endDate?: string }): Promise<
    PaginationResponse<Order>
  > {
    const offset = (page - 1) * limit;

    const whereCondition: any = {};

    // Фильтр по ID заказа (если в search пришло число)
    if (search) {
      if (!isNaN(Number(search))) {
        whereCondition.id = Number(search);
      }
    }

    // Фильтр по диапазону дат (если обе даты переданы)
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) {
        whereCondition.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereCondition.createdAt[Op.lte] = new Date(endDate);
      }
    }

    if (userId) {
      whereCondition.userId = userId;
    }

    const { rows: orders, count: totalItems } = await this.orderModel.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [[sort, order]],
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }, { model: Category }],
            },
          ],
        },
      ],
    });

    return {
      items: orders,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      pageNumber: page,
      limit,
    };
  }

  async findOneOrder(id: number): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }, { model: Category }],
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    return order;
  }

  async updateOrderPaymentStatus({
    transactionId,
    orderStatus,
    paymentStatus,
  }: UpdatePaymentStatusDto): Promise<Order> {
    // Начинаем транзакцию
    const transaction = await this.orderModel.sequelize.transaction();

    try {
      // Поиск заказа по transactionId
      const order = await this.orderModel.findOne({
        where: { transactionId },
        transaction, // Используем транзакцию для консистентности данных
      });

      if (!order) {
        throw new NotFoundException(`Заказ с transactionId ${transactionId} не найден.`);
      }

      if (!orderStatus) {
        throw new BadRequestException('Статус заказа обязателен.');
      }

      // Обновляем статус заказа и платежа
      order.orderStatus = orderStatus;
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
      await order.save({ transaction });

      // Фиксируем изменения в БД
      await transaction.commit();

      // Отправка уведомлений после успешного обновления
      await this.notificationService.sendNotificationToAdmin<Order>({
        type: WS_MESSAGE_TYPE.ORDER_STATUS,
        payload: order,
      });

      await this.notificationService.sendUserNotification<Order>({
        recipientUserIds: [order.userId],
        message: {
          type: WS_MESSAGE_TYPE.ORDER_STATUS,
          payload: order,
        },
      });

      return order; // Возвращаем обновленный объект заказа
    } catch (error) {
      // Откатываем транзакцию при ошибке
      await transaction.rollback();
      throw error;
    }
  }
}
