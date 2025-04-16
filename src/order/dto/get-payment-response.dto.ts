import { ApiProperty } from '@nestjs/swagger';
import { GetPaymentsResponseDto, PaymentAmountDto } from './get-payments-response.dto';

class CancellationDetailsDto {
  @ApiProperty({ example: 'yoo_money', description: 'Party that initiated the cancellation' })
  party: string;

  @ApiProperty({ example: 'expired_on_confirmation', description: 'Reason for the cancellation' })
  reason: string;
}

class PaymentDetailsDto extends GetPaymentsResponseDto {
  @ApiProperty({ type: PaymentAmountDto, description: 'Refunded amount details', required: false })
  refunded_amount?: PaymentAmountDto;

  @ApiProperty({ example: '2025-01-09T07:11:11.138Z', description: 'Time of capture', required: false })
  captured_at?: string;

  @ApiProperty({ type: CancellationDetailsDto, description: 'Details about the cancellation of the payment', required: false })
  cancellation_details?: CancellationDetailsDto;
}

export class GetPaymentResponseDto {
  @ApiProperty({ type: PaymentDetailsDto, description: 'Detailed information about the payment' })
  payment: PaymentDetailsDto;
}
