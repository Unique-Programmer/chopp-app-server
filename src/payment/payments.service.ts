import { Injectable, HttpException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { randomBytes } from 'crypto';
import { YOOKASSA_URL } from './constants';
import { CreateRefundDto } from 'src/order/dto/create-refund.dto';
import { GetRefundResponseDto } from 'src/order/dto/get-refund-response.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from 'src/products/product.model';
import { CapturePaymentDto } from './dto/capture-payment.dto';
import { Order } from 'src/order/order.model';
import { OrderItem } from 'src/order/order-item.model';
import { YooKassaWebhookService } from './yookassa-webhook.service';
import { NotificationService } from 'src/websockets/notification/notification.service';
import { PAYMENT_STATUS, WS_MESSAGE_TYPE } from 'src/shared/enums/';
import { User } from 'src/users/users.model';
import qs from 'qs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    private readonly httpService: HttpService,
    private readonly subscriptionService: YooKassaWebhookService,
    private readonly notificationService: NotificationService,
  ) {}

  private getAuthHeader(): string {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`;
  }

  private generateIdempotenceKey(): string {
    return randomBytes(16).toString('hex');
  }

  private createHeaders(idempotenceKey?: string): Record<string, string> {
    return {
      Authorization: this.getAuthHeader(),
      'Content-Type': 'application/json',
      ...(idempotenceKey && { 'Idempotence-Key': idempotenceKey }),
    };
  }

  private createReceipt({ items, user }: { items: OrderItem[]; user: User }) {
    const customer = {
      email: user.email,
      phone: user.phoneNumber,
    };

    const receiptItems = items.map((item) => {
      return {
        description: item.product.title,
        quantity: item.quantity,
        amount: {
          value: Number(item.price).toFixed(2),
          currency: 'RUB',
        },
        //TODO: узнать че за vat_code
        vat_code: 1,
      };
    });

    return { customer, items: receiptItems };
  }

  private async makeHttpRequest<T>(
    url: string,
    method: 'GET' | 'POST',
    data?: any,
    headers: Record<string, string> = {},
    params?: Record<string, any>,
  ): Promise<T> {
    try {
      // 🌿 Очистка заголовков для GET-запроса
      if (method === 'GET' && headers['Content-Type']) {
        delete headers['Content-Type'];
      }
  
      // 🌐 Нормализация query-параметров
      let paramsNormalized: URLSearchParams | undefined = undefined;
      if (params && Object.keys(params).length > 0) {
        paramsNormalized = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => paramsNormalized!.append(key, v));
          } else {
            paramsNormalized!.append(key, value);
          }
        });
      }
  
      // 🛠️ Сборка конфига
      const config: AxiosRequestConfig = {
        url,
        method,
        headers,
        timeout: 5000,
        params: paramsNormalized,
      };
  
      // ✏️ Добавляем тело только если не GET
      if (method !== 'GET' && data !== undefined) {
        config.data = data;
      }
  
      // 🧪 Отладка
      console.log('🌐 Запрос:', {
        url,
        method,
        headers,
        params: paramsNormalized?.toString(),
        data: config.data,
      });
  
      const response = await this.httpService.request<T>(config).toPromise();
  
      console.log('✅ Ответ:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка запроса:', {
        message: error.message,
        code: error.code,
        url,
        method,
        headers,
      });
  
      throw new NotFoundException(
        error.response?.data || 'Unexpected error occurred',
      );
    }
  }
  

  async createPayment({
    amount,
    currency,
    description,
    returnUrl,
    metadata,
    user,
    items,
  }: {
    amount: string;
    currency: string;
    description: string;
    returnUrl: string;
    metadata: Record<string, any>;
    user: User;
    items: OrderItem[];
  }): Promise<any> {
    const receipt = this.createReceipt({ items, user });

    const body = {
      amount: { value: Number(amount).toFixed(2), currency },
      payment_method_data: { type: 'bank_card' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      capture: true,
      description,
      metadata,
      receipt,
    };

    const headers = this.createHeaders(this.generateIdempotenceKey());

    await this.notificationService.sendNotificationToAdmin({
      type: WS_MESSAGE_TYPE.NEW_PAYMENT,
      payload: body,
    });

    await this.notificationService.sendUserNotification({
      recipientUserIds: [user.id],
      message: {
        type: WS_MESSAGE_TYPE.NEW_PAYMENT,
        payload: body,
      },
    });

    return this.makeHttpRequest(`${YOOKASSA_URL}/payments`, 'POST', body, headers);
  }

  async payForOrder({ orderId, returnUrl }: { orderId: number; returnUrl: string }): Promise<any> {
    const order = await this.orderModel.findOne({
      where: { id: orderId },
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: User, attributes: ['id', 'email', 'phoneNumber'] },
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    if (order.paymentStatus !== 'pending') {
      throw new Error(`Order with ID ${orderId} cannot be paid. Current payment status: ${order.paymentStatus}`);
    }

    const paymentResult = await this.createPayment({
      amount: order.totalPrice.toString(),
      currency: 'RUB',
      description: `Оплата за заказ ${order.id}`,
      returnUrl,
      metadata: { order_id: order.id },
      user: order.user,
      items: order.items,
    });

    order.transactionId = paymentResult.id;
    order.paymentStatus = PAYMENT_STATUS.PENDING;
    order.paymentUrl = paymentResult.confirmation.confirmation_url;
    await order.save();

    await this.subscriptionService.createSubscription({
      transactionId: paymentResult.id,
      orderId,
      status: 'pending',
    });

    return {
      id: order.id,
      totalPrice: order.totalPrice,
      quantity: order.quantity,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      transactionId: order.transactionId,
      paymentUrl: order.paymentUrl,
    };
  }

  async getPayments(params: Record<string, any>): Promise<any> {
    const headers = this.createHeaders(String(Math.round(Math.random() * 1000000)));
    console.log('--- 2 headers: ', headers);
    return this.makeHttpRequest(`${YOOKASSA_URL}/payments`, 'GET', null, headers, params);
  }

  async getPaymentById(paymentId: string): Promise<any> {
    const headers = this.createHeaders();
    return this.makeHttpRequest(`${YOOKASSA_URL}/payments/${paymentId}`, 'GET', null, headers);
  }

  async capturePayment(paymentId: string, captureData?: CapturePaymentDto): Promise<any> {
    const headers = this.createHeaders();
    return this.makeHttpRequest(`${YOOKASSA_URL}/payments/${paymentId}/capture`, 'POST', captureData, headers);
  }

  async cancelPayment(paymentId: string): Promise<any> {
    const headers = this.createHeaders();
    return this.makeHttpRequest(`${YOOKASSA_URL}/payments/${paymentId}/cancel`, 'POST', {}, headers);
  }

  async createRefund(refundData: CreateRefundDto): Promise<any> {
    const headers = this.createHeaders(this.generateIdempotenceKey());
    return this.makeHttpRequest(`${YOOKASSA_URL}/refunds`, 'POST', refundData, headers);
  }

  async getRefunds(params: Record<string, any>): Promise<any> {
    const headers = this.createHeaders();
    return this.makeHttpRequest(`${YOOKASSA_URL}/refunds`, 'GET', null, headers, params);
  }

  async getRefundById(refundId: string): Promise<GetRefundResponseDto> {
    const headers = this.createHeaders();
    return this.makeHttpRequest(`${YOOKASSA_URL}/refunds/${refundId}`, 'GET', null, headers);
  }

  async getReceipts(params: Record<string, any>): Promise<any> {
    const headers = this.createHeaders();
    return this.makeHttpRequest(`${YOOKASSA_URL}/receipts`, 'GET', null, headers, params);
  }
}
