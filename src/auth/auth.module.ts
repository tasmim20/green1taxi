import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { parseExpiration } from './utils/parse-expiration';

dotenv.config();

@Module({
  imports: [
    // gRPC Client for Auth service
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../proto/auth.proto'),
          url: `${process.env.AUTH_SERVICE_HOST}:${process.env.AUTH_SERVICE_PORT}`,
        },
      },
    ]),

    // JWT Module
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: parseExpiration(process.env.JWT_ACCESS_EXPIRATION),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // If you need to use AuthService in other modules
})
export class AuthModule {}
