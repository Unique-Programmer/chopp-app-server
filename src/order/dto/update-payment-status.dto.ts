import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS, PAYMENT_STATUS } from 'src/shared/enums';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'Идентификатор транзакции платежа',
    example: '22e12f66-000f-5000-8000-18db351245c7',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Новый статус заказа',
    example: ORDER_STATUS.DELIVERED,
    enum: ORDER_STATUS,
    enumName: 'ORDER_STATUS', // Добавляем enumName, чтобы Swagger правильно обработал enum
  })
  orderStatus: ORDER_STATUS;

  @ApiProperty({
    description: 'Новый статус платежа (если требуется обновление)',
    example: PAYMENT_STATUS.SUCCEEDED,
    enum: PAYMENT_STATUS,
    enumName: 'PAYMENT_STATUS', // Добавляем enumName
    required: false,
  })
  paymentStatus?: PAYMENT_STATUS;
}
