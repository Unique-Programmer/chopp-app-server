import { ApiProperty } from '@nestjs/swagger';
import { ShoppingCartItemDto } from './shopping-cart-item.dto';

export class ShoppingCartDto {
  @ApiProperty({
    type: [ShoppingCartItemDto],
    description: 'List of items in the shopping cart',
  })
  items: any[];

  @ApiProperty({
    example: 3000,
    description: 'Total price of all items in the shopping cart',
  })
  totalPrice: number;

  @ApiProperty({
    example: 30,
    description: 'Quantity of all items in the shopping cart',
  })
  quantity: number;
}
