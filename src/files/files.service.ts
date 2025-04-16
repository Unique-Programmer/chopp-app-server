import { Injectable } from '@nestjs/common';
// import AWS from 'aws-sdk';
// import { ConfigService } from '@nestjs/config';
import { writeFile } from 'fs/promises';
import * as path from 'path';
// import { File } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { FileModel } from './file.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class FilesService {
  // private s3: AWS.S3;

  constructor(
    @InjectModel(FileModel) private readonly fileModel: typeof FileModel,
  ) {
    // this.s3 = new AWS.S3({
    //   accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
    //   secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    // });
  }

  private computeHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  async uploadFile(file: any): Promise<FileModel> {
    const fileHash = this.computeHash(file.buffer);

    //Потенциально узкое горлышко, поиск по записям файлов
    let fileRecord = await this.fileModel.findOne({
      where: { hash: fileHash },
    });

    if (!fileRecord) {
      const fileExtension = path.extname(file.originalname);
      const fileName = uuidv4() + fileExtension;
      const filePath = path.join('./uploads', fileName);

      await writeFile(filePath, file.buffer);

      fileRecord = await this.fileModel.create({
        hash: fileHash,
        path: fileName,
        originalName: file.originalname,
        size: file.size,
      });
    }

    return fileRecord;

    // const fileExtension = path.extname(file.originalname);
    // const fileName = uuidv4() + fileExtension;
    // const filePath = path.join('./uploads', fileName);

    // await writeFile(filePath, file.buffer); // Использование Promise-based функции writeFile из модуля 'fs/promises'
    // return filePath;
  }

  // async uploadFileToS3(file: File): Promise<AWS.S3.ManagedUpload.SendData> {
  //   const uploadParams = {
  //     Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
  //     Key: `${Date.now()}-${file.originalname}`,
  //     Body: file.buffer,
  //   };

  //   return this.s3.upload(uploadParams).promise();
  // }
}
