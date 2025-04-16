// order-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS, PAYMENT_STATUS } from 'src/shared/enums';

export class CreatePaymentResponseDto {
  @ApiProperty({ description: 'ID of the order' })
  id: number;

  @ApiProperty({ description: 'Total price of the order' })
  totalPrice: number;

  @ApiProperty({ description: 'Total quantity of items in the order' })
  quantity: number;

  @ApiProperty({
    description: 'Current status of the order',
    enum: ORDER_STATUS,
  })
  orderStatus: string;

  @ApiProperty({
    description: 'Current status of the payment',
    enum: PAYMENT_STATUS,
  })
  paymentStatus: string;

  @ApiProperty({ description: 'Transaction ID for the payment' })
  transactionId: string;

  @ApiProperty({ description: 'URL to redirect user for payment' })
  paymentUrl: string;
}
