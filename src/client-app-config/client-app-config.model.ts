import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'client_app_config' })
export class ClientAppConfig extends Model<ClientAppConfig> {
  @ApiProperty({
    example: '1',
    description: 'The unique identifier for the client app configuration',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    defaultValue: 1,
  })
  id: number;

  @ApiProperty({
    example: '20.00',
    description: 'Average cost of delivery, can be null if not specified',
  })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  averageDeliveryCost?: number;

  @ApiProperty({
    example: 'true',
    description: 'Does free delivery included',
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  freeDeliveryIncluded: boolean;

  @ApiProperty({
    example: '200',
    description: 'Amount from witch free delivery applied',
  })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  freeDeliveryThreshold?: number;

  @ApiProperty({
    example: '09:00',
    description: 'Время начала работы сервиса для клиентов в формате ISO',
    required: false,
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  openTime?: string;

  @ApiProperty({
    example: '21:00',
    description: 'Время окончания работы сервиса для клиентов',
    required: false,
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  closeTime?: string;

  @ApiProperty({
    example: true,
    description: 'Ведется ли прием заказов',
    required: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  disabled?: boolean;

  @ApiProperty({
    example: true,
    description: 'Этот текст будет указан на странице \"Доставка и оплата\"',
    required: false,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  deliveryAndPaymentsVerbose?: string;

  @ApiProperty({
    example: true,
    description: 'Этот текст будет указан на странице \"Публичаня оферта\"',
    required: false,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  publicOfferVerbose?: string;

  @ApiProperty({
    example: true,
    description: 'Этот текст будет указан на странице \"О нас\"',
    required: false,
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;
}
