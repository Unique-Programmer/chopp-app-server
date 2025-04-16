import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileModel } from './file.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'src/products/product.model';
import { ProductsModule } from 'src/products/products.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    SequelizeModule.forFeature([FileModel, Product]),
    forwardRef(() => ProductsModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
