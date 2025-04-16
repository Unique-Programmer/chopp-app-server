// src/payment/dto/get-refunds.dto.ts

import { ApiProperty } from '@nestjs/swagger';

class RefundDto {
  @ApiProperty({ example: '2f146528-000f-5000-b000-1b473822ef7b', description: 'Идентификатор возврата' })
  id: string;

  @ApiProperty({ example: '100.00', description: 'Сумма возврата' })
  amount: string;

  @ApiProperty({ example: 'RUB', description: 'Валюта суммы возврата' })
  currency: string;

  @ApiProperty({ example: '2025-01-11T11:09:28.375Z', description: 'Дата создания возврата' })
  createdAt: string;
}

export class GetRefundsResponseDto {
  @ApiProperty({ type: [RefundDto], description: 'Список возвратов' })
  items: RefundDto[];
}
