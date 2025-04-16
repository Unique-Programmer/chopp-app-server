import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for the product',
    example: 3,
    type: Number,
    minimum: 0
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(0, { message: 'Quantity must be zero or more' })
  quantity: number;
}
