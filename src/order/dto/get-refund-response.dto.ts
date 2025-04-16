import { ApiProperty } from '@nestjs/swagger';

export class GetRefundResponseDto {
  @ApiProperty({ example: '2f146528-000f-5000-b000-1b473822ef7b', description: 'Идентификатор возврата' })
  id: string;

  @ApiProperty({ example: 'succeeded', description: 'Статус возврата' })
  status: string;

  @ApiProperty({ example: '100.00', description: 'Сумма возврата' })
  amount: string;

  @ApiProperty({ example: 'RUB', description: 'Валюта возврата' })
  currency: string;

  @ApiProperty({ example: '2025-01-12T12:00:00Z', description: 'Дата создания возврата' })
  createdAt: string;
}
