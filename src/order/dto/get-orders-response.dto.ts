import { ApiProperty } from '@nestjs/swagger';
import { ShoppingCartItemDto } from 'src/shopping-cart/dto/shopping-cart-item.dto';

class OrderDto {
  @ApiProperty({ example: 1, description: 'ID of the order' })
  id: number;

  @ApiProperty({ example: 1, description: 'User ID associated with the order' })
  userId: number;

  @ApiProperty({ type: [ShoppingCartItemDto], description: 'List of items in the order' })
  items: ShoppingCartItemDto[];

  @ApiProperty({ example: 500.00, description: 'Total price of the order' })
  totalPrice: number;

  @ApiProperty({ example: 3, description: 'Total quantity of items in the order' })
  quantity: number;

  @ApiProperty({ example: 'pending', description: 'Current status of the order' })
  orderStatus: string;

  @ApiProperty({ example: 'pending', description: 'Current status of the payment' })
  paymentStatus: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Transaction ID for the payment' })
  transactionId: string;

  @ApiProperty({ example: 'https://payment.url', description: 'URL to redirect user for payment' })
  paymentUrl: string;
}

export class GetOrdersResponseDto {
  @ApiProperty({ type: [OrderDto], description: 'Array of orders' })
  items: OrderDto[];

  @ApiProperty({ example: 50, description: 'Total number of items' })
  totalItems: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  pageNumber: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;
}
