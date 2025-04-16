import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  // В этом случае дополнительные данные могут не потребоваться.
  // Если требуется передать сумму, можно добавить следующие поля:

  @ApiProperty({
    example: 'https://example.com',
    description: 'return URL',
    required: false,
  })
  returnUrl?: string;
}
