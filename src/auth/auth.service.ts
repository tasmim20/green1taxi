/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';

import { LoginDto } from './dto/login.dto';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  user: any; // You can customize this to match your user object
}

@Injectable()
export class AuthService {
  private authService: any;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {
    this.authService = this.client.getService<any>('AuthService'); // Get the service from the gRPC client
  }

  // Register method
  register(createUserDto: RegisterRequest) {
    return this.authService.Register(createUserDto); // Calls the gRPC Register method
  }

  // Login method
  login(loginDto: LoginDto) {
    return this.authService.Login(loginDto); // Calls the gRPC Login method
  }

  // Refresh token method
  refreshToken({ refreshToken }: { refreshToken: string }) {
    return this.authService.RefreshToken({ refreshToken });
  }

  // Confirm registration method
  confirmRegistration({ token }: { token: string }) {
    return this.authService.ConfirmRegistration({ token });
  }

  // Logout method
  logout({ refreshToken }: { refreshToken: string }) {
    return this.authService.Logout({ refreshToken });
  }

  // Forgot password method
  forgotPassword({ email }: { email: string }) {
    return this.authService.ForgotPassword({ email });
  }

  // Reset password method with OTP
  resetPassword({
    email,
    otp,
    newPassword,
  }: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    return this.authService.ResetPassword({ email, otp, newPassword });
  }

  // Reset password method without OTP
  resetPasswordWithoutOtp({
    email,
    currentPassword,
    newPassword,
  }: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }) {
    return this.authService.ResetPasswordWithoutOtp({
      email,
      currentPassword,
      newPassword,
    });
  }
}
