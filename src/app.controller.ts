/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
// /* eslint-disable prettier/prettier */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { Controller, Get, Post, Body } from '@nestjs/common';
// import { Client, ClientTCP, Transport } from '@nestjs/microservices';
// import { lastValueFrom } from 'rxjs'; // Import lastValueFrom from rxjs

// @Controller()
// export class AppController {
//   @Client({
//     transport: Transport.TCP,
//     options: { host: '127.0.0.1', port: 5002 },
//   })
//   client: ClientTCP;

//   // Define a handler for the root path (GET /)
//   @Get()
//   getHello(): string {
//     return 'Hello from API Gateway!'; // Return a message when the root path is accessed
//   }

//   // Register route (for testing TCP communication)
//   @Post('register')
//   async register(
//     @Body() body: { email: string; password: string; role: string },
//   ) {
//     // Use lastValueFrom to await the observable from client.send()
//     const response = await lastValueFrom(this.client.send('register', body));
//     return response; // Return the response from the microservice
//   }

//   // Login route (for testing TCP communication)
//   @Post('login')
//   async login(@Body() body: { email: string; password: string }) {
//     const response = await lastValueFrom(this.client.send('login', body)); // Await the observable result
//     return response;
//   }
// }

// api-gateway/src/app.controller.ts
import { Controller, Get, Post, Body, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get()
  getHello() {
    return { message: 'API Gateway is running 🚀' };
  }

  @Post('auth/register')
  async register(@Body() createUserDto: any) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'register' }, createUserDto),
    );
  }

  @Post('auth/login')
  async login(@Body() loginDto: any) {
    return firstValueFrom(this.authClient.send({ cmd: 'login' }, loginDto));
  }

  @Post('auth/logout')
  async logout() {
    return firstValueFrom(this.authClient.send({ cmd: 'logout' }, {}));
  }

  // Get all users
  @Get('auth/users')
  async getAllUsers() {
    return firstValueFrom(this.authClient.send({ cmd: 'users' }, {}));
  }

  // Get user by email
  @Get('auth/user')
  async getUserByEmail(@Query('email') email: string) {
    return firstValueFrom(this.authClient.send({ cmd: 'user/email' }, email));
  }

  // ------------------- DRIVERS -------------------

  // Get all drivers
  @Get('auth/drivers')
  async getAllDrivers() {
    return firstValueFrom(this.authClient.send({ cmd: 'drivers' }, {}));
  }

  // Get driver by email
  @Get('auth/driver')
  async getDriverByEmail(@Query('email') email: string) {
    return firstValueFrom(this.authClient.send({ cmd: 'driver/email' }, email));
  }
}
