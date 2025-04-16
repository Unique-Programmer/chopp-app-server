import { ApiProperty } from '@nestjs/swagger';

export class CreateClientAppConfigDto {
  @ApiProperty({
    example: 20.0,
    description: 'Average cost of delivery, can be null if not specified',
    required: false,
  })
  averageDeliveryCost?: number;

  @ApiProperty({
    example: false,
    description: 'Indicates if free delivery is included, defaults to false',
    required: false,
  })
  freeDeliveryIncluded?: boolean;

  @ApiProperty({
    example: 100.0,
    description: 'Threshold for free delivery, can be null if not specified',
    required: false,
  })
  freeDeliveryThreshold?: number;

  @ApiProperty({
    example: '09:00',
    description: 'Время начала работы сервиса для клиентов в формате ISO',
    required: false,
  })
  openTime?: string;

  @ApiProperty({
    example: '21:00',
    description: 'Время окончания работы сервиса для клиентов',
    required: false,
  })
  closeTime?: string;

  @ApiProperty({
    example: true,
    description: 'Ведется ли прием заказов',
    required: false,
  })
  disabled?: boolean;

  @ApiProperty({
    example: true,
    description: 'Этот текст будет указан на странице \"Доставка и оплата\"',
    required: false,
  })
  deliveryAndPaymentsVerbose?: string;

  @ApiProperty({
    example: true,
    description: 'Этот текст будет указан на странице \"Публичаня оферта\"',
    required: false,
  })
  publicOfferVerbose?: string;

  @ApiProperty({
    example: true,
    description: 'Этот текст будет указан на странице \"О нас\"',
    required: false,
  })
  description?: string;
}
