import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Multer } from 'multer';
import * as express from 'express';

const DEFAULT_API_PREFIX = 'api';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const API_PREFIX = process.env.API_PREFIX || DEFAULT_API_PREFIX;
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*', allowedHeaders: '*' });

  app.setGlobalPrefix(API_PREFIX);

  app.use('/uploads', express.static('./uploads'));

  const config = new DocumentBuilder()
    .setTitle("Chopp app's methods description")
    .setDescription('Note, when you need update info')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`/docs`, app, document);

  await app.listen(PORT, () =>
    console.log(`server started on port === ${PORT}`),
  );
}

bootstrap();
