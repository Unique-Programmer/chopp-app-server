import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FileModel } from '../files/file.model';
import { ProductFile } from '../products/product-file.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);

  constructor(
    @InjectModel(FileModel) private readonly fileModel: typeof FileModel,
    @InjectModel(ProductFile) private readonly productFileModel: typeof ProductFile,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanup-unused-files',
    timeZone: 'Europe/Moscow',
  })
  async cleanupUnusedFiles() {
    this.logger.log('Starting cleanup of unused image files...');

    const usedFileIds = await this.productFileModel.findAll({
      attributes: ['fileId'],
      raw: true,
    });

    const fileIdsInUse = usedFileIds.map((item) => item.fileId);

    const unusedFiles = await this.fileModel.findAll({
      where: {
        id: {
          [Op.notIn]: fileIdsInUse.length ? fileIdsInUse : [0],
        },
      },
      raw: true,
    });

    this.logger.log(`Found ${unusedFiles.length} unused files to delete`);

    for (const file of unusedFiles) {
      try {
        const filePath = path.join(process.cwd(), file.path);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted file from disk: ${filePath}`);
        } else {
          this.logger.warn(`File not found on disk: ${filePath}`);
        }

        await this.fileModel.destroy({
          where: {
            id: file.id,
          },
        });
      } catch (error) {
        this.logger.error(`Error deleting file ${file.id}: ${error.message}`);
      }
    }

    this.logger.log('Cleanup completed');
  }
}
