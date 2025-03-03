import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { FileModel } from 'src/files/file.model';
import { Product } from './product.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'product_files',
  createdAt: false,
  updatedAt: false,
})
export class ProductFile extends Model<ProductFile> {
  @ApiProperty({ example: '1', description: 'primary key id' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Разрешаем NULL
    onDelete: 'SET NULL', // Устанавливаем NULL при удалении продукта
  })
  productId: number | null;

  @ForeignKey(() => FileModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  fileId: number;
}
