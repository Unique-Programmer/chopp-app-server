import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { ProductsController } from './products.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './product.model';
import { FilesModule } from 'src/files/files.module';
import { FileModel } from 'src/files/file.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, FileModel]),
    forwardRef(() => FilesModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProductsController],
  providers: [ProductService],
  exports: [ProductService], // Экспортируйте ProductService, если он будет использоваться в других модулях
})
export class ProductsModule {}
