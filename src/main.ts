/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  // ✅ CORS should be enabled here
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // ✅ Ensure uploads folder exists
  const uploadPath = join(process.cwd(), 'uploads/profile');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
    console.log(`✅ Created uploads folder at ${uploadPath}`);
  }

  // ✅ Serve static files from uploads folder
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(parseInt(process.env.API_GATEWAY_PORT!));
  console.log(`✅ API Gateway running on port ${process.env.API_GATEWAY_PORT}`);
}

bootstrap();
