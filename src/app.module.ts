import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

// Passport and JWT Modules
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
// Ensure the correct path for the strategy

dotenv.config();

@Module({
  imports: [
    // Existing microservice client registration
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST!,
          port: parseInt(process.env.AUTH_SERVICE_PORT!),
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST!,
          port: parseInt(process.env.USER_SERVICE_PORT!),
        },
      },
    ]),

    // Add Passport and JwtModule for JWT authentication
    PassportModule.register({ defaultStrategy: 'jwt', session: false }), // Register Passport with the default 'jwt' strategy
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'fallback_secret', // Ensure JWT secret is set
      signOptions: { expiresIn: '30s' }, // Token expiration time (adjust as needed)
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy], // Add the JwtStrategy here
})
export class AppModule {}
