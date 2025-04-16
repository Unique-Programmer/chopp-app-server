import {
  Column,
  Model,
  Table,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { ShoppingCart } from './shopping-cart.model';
import { Product } from 'src/products/product.model';
import { Order } from 'src/order/order.model';

@Table({ tableName: 'shopping_cart_items' })
export class ShoppingCartItem extends Model<ShoppingCartItem> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Разрешаем NULL
    onDelete: 'SET NULL', // Устанавливаем NULL при удалении продукта
  })
  productId: number | null;

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => ShoppingCart)
  @Column({
    type: DataType.INTEGER,
  })
  shoppingCartId: number;

  @BelongsTo(() => ShoppingCart)
  shoppingCart: ShoppingCart;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity: number;
}
