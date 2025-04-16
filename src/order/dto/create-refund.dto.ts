import { ApiProperty } from '@nestjs/swagger';

class AmountDto {
  @ApiProperty({ example: '100.00', description: 'Сумма возврата' })
  value: string;

  @ApiProperty({ example: 'RUB', description: 'Валюта возврата' })
  currency: string;
}

export class CreateRefundDto {
  @ApiProperty({ example: '2f146528-000f-5000-b000-1b473822ef7b', description: 'Идентификатор платежа' })
  payment_id: string;

  @ApiProperty({ description: 'Сумма возврата', type: () => AmountDto })
  amount: AmountDto;
}
