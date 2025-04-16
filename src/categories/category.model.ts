import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Product } from 'src/products/product.model';

@Table({ tableName: 'categories' })
export class Category extends Model<Category> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order: number;

  @HasMany(() => Product)
  products: Product[];
}
