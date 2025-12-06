// import { Module } from '@nestjs/common';
// import { ClientsModule, Transport } from '@nestjs/microservices';
// import { UserController } from './user.controller';

// import { JwtModule } from '@nestjs/jwt';
// import { join } from 'path';
// import * as dotenv from 'dotenv';
// import { userService } from './user.service';

// dotenv.config();

// @Module({
//   imports: [
//     // gRPC Client for User service
//     ClientsModule.register([
//       {
//         name: 'USER_SERVICE',
//         transport: Transport.GRPC,
//         options: {
//           package: 'user',
//           protoPath: join(__dirname, '../../proto/user.proto'),
//           url: `${process.env.USER_SERVICE_HOST}:${process.env.USER_SERVICE_PORT}`,
//         },
//       },
//     ]),

//     // You can add JwtModule if it's required for User-related functionality (e.g., accessing user data)
//     JwtModule.register({
//       secret: process.env.JWT_ACCESS_SECRET,
//       signOptions: { expiresIn: '3600s' },
//     }),
//   ],
//   controllers: [UserController],
//   providers: [userService],
//   exports: [userService], // If you need to use UserService in other modules
// })
// export class UserModule {}
