import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FileModel } from '../files/file.model';
import { ProductFile } from '../products/product-file.model';
import { FileCleanupService } from './file-cleanup.service';

@Module({
  imports: [SequelizeModule.forFeature([FileModel, ProductFile])],
  providers: [FileCleanupService],
})
export class FileCleanupModule {}
