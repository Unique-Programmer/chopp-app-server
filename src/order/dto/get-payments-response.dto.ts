import { ApiProperty } from '@nestjs/swagger';

export class PaymentAmountDto {
  @ApiProperty({ example: '3000.00', description: 'Amount of the payment' })
  value: string;

  @ApiProperty({ example: 'RUB', description: 'Currency of the payment' })
  currency: string;
}

class PaymentMethodDto {
  @ApiProperty({ example: 'bank_card', description: 'Type of the payment method' })
  type: string;

  @ApiProperty({ example: '2f146528-000f-5000-b000-1b473822ef7b', description: 'ID of the payment method' })
  id: string;

  @ApiProperty({ example: false, description: 'Indicates if the payment method is saved' })
  saved: boolean;

  @ApiProperty({ example: 'inactive', description: 'Status of the payment method' })
  status: string;

  @ApiProperty({ example: 'YooMoney wallet 410011758831136', description: 'Title of the payment method', required: false })
  title?: string;

  @ApiProperty({ example: '410011758831136', description: 'Account number of the payment method', required: false })
  account_number?: string;
}

class PaymentDto {
  @ApiProperty({ example: '2f146528-000f-5000-b000-1b473822ef7b', description: 'ID of the payment' })
  id: string;

  @ApiProperty({ example: 'canceled', description: 'Status of the payment' })
  status: string;

  @ApiProperty({ type: PaymentAmountDto, description: 'Amount details of the payment' })
  amount: PaymentAmountDto;

  @ApiProperty({ type: PaymentMethodDto, description: 'Payment method details' })
  payment_method: PaymentMethodDto;

  @ApiProperty({ example: 'Payment for order 8', description: 'Description of the payment' })
  description: string;

  @ApiProperty({ example: '2025-01-11T11:09:28.375Z', description: 'Creation time of the payment' })
  created_at: string;

  @ApiProperty({ example: true, description: 'Indicates if the operation was in test mode' })
  test: boolean;

  @ApiProperty({ example: false, description: 'Indicates if the payment was paid' })
  paid: boolean;

  @ApiProperty({ example: false, description: 'Indicates if the payment is refundable' })
  refundable: boolean;
}

export class GetPaymentsResponseDto {
  @ApiProperty({ example: 'list', description: 'Type of the response' })
  type: string;

  @ApiProperty({ type: [PaymentDto], description: 'List of payments' })
  items: PaymentDto[];
}
