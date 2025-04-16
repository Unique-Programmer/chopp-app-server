import { ApiProperty } from '@nestjs/swagger';

export class CapturePaymentDto {
  // В этом случае дополнительные данные могут не потребоваться.
  // Если требуется передать сумму, можно добавить следующие поля:

  @ApiProperty({
    example: '100.00',
    description: 'Amount to capture',
    required: false,
  })
  value?: string;

  @ApiProperty({
    example: 'RUB',
    description: 'Currency of the amount to capture',
    required: false,
  })
  currency?: string;
}
