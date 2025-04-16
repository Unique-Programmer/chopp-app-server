import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddProductToCartDto {
  @ApiProperty({
    description: 'ID of the product to add to the cart',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'Product ID must be an integer' })
  productId: number;

  @ApiProperty({
    description: 'Quantity of the product to add',
    example: 2,
    type: Number,
    minimum: 1
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
