import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'order_stats',
  timestamps: false,
})
export class OrderStats extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.DATEONLY,
    field: 'order_date',
  })
  orderDate: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  product: {
    price: {
      value: string;
      currency: string;
    };
    title: string;
    quantity: number;
  };
}
