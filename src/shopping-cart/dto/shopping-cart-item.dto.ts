import { ApiProperty } from '@nestjs/swagger';

export class ShoppingCartItemDto {
  @ApiProperty({ example: 1, description: 'The ID of the product' })
  productId: number;

  @ApiProperty({ example: 'Laptop', description: 'Name of the product' })
  productName: string;

  @ApiProperty({ example: 750, description: 'Price per unit of the product' })
  price: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product in the cart',
  })
  quantity: number;
}
