/* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable prettier/prettier */
// import * as dotenv from 'dotenv';
// dotenv.config(); // Load environment variables

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// async function bootstrap() {
//   // Create HTTP app (API Gateway)
//   const app = await NestFactory.create(AppModule);
//   await app.listen(5000); // Expose HTTP service on port 5000

//   // Create TCP microservice client for internal communication with Auth Service
//   const microserviceApp =
//     await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
//       transport: Transport.TCP, // TCP communication
//       options: {
//         host: '127.0.0.1',
//         port: 5001, // Auth Service is listening on port 5003
//       },
//     });
//   await microserviceApp.listen(); // Start TCP service
// }

// bootstrap();

/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  // ✅ CORS should be enabled here
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  await app.listen(parseInt(process.env.API_GATEWAY_PORT!));
  console.log(`✅ API Gateway running on port ${process.env.API_GATEWAY_PORT}`);
}

bootstrap();
