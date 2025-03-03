import { Column, Model, Table, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from 'src/products/product.model';

@Table({ tableName: 'order_items' })
export class OrderItem extends Model<OrderItem> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Разрешаем NULL
    onDelete: 'SET NULL', // Устанавливаем NULL при удалении продукта
  })
  productId: number | null;

  @BelongsTo(() => Product)
  product: Product;

  @Column({ type: DataType.INTEGER })
  quantity: number;

  @Column({ type: DataType.FLOAT })
  price: number;
}
