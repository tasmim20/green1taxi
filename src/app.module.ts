import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { join } from 'path';
import { parseExpiration } from './auth/utils/parse-expiration';
// Add your API Gateway User Controller

dotenv.config();

@Module({
  imports: [
    // -------------------------------
    // 🔵 gRPC Microservice Clients
    // -------------------------------
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../proto/auth.proto'),
          url: `${process.env.AUTH_SERVICE_HOST}:${process.env.AUTH_SERVICE_PORT}`,
        },
      },
      {
        name: 'USER_SERVICE', // Add User Service
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../proto/user.proto'),
          url: `${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`,
        },
      },
    ]),

    // JWT + Passport
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: parseExpiration(process.env.JWT_ACCESS_EXPIRATION),
      },
    }),
  ],

  controllers: [AppController], // Add UserController
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
