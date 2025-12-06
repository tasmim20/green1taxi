/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpException,
  Req,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponse } from './interfaces/auth-interface';

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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register endpoint
  @Post('register')
  async register(@Body() createUserDto: RegisterRequest) {
    if (!createUserDto || !createUserDto.role) {
      throw new HttpException(
        'Invalid registration data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.register(createUserDto);
  }

  // Login endpoint
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result: AuthResponse = await this.authService.login(loginDto);
    if (result?.status === 'error')
      return res.status(HttpStatus.BAD_REQUEST).json(result);

    const { accessToken, refreshToken, role } = result;
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ accessToken, refreshToken, role });
  }

  // Refresh token endpoint
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    // Cast the request object to any to access cookies
    const refreshToken = (req as any).cookies?.refresh_token;

    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Refresh token missing' });
    }

    const result: AuthResponse = await this.authService.refreshToken({
      refreshToken,
    });

    if (!result || !result.accessToken || !result.refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid refresh token' });
    }

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  // Confirm email endpoint
  @Post('confirm')
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmRegistration({ token });
  }

  // Logout endpoint
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = (req as any).cookies?.refresh_token;
    try {
      if (refreshToken) {
        await this.authService.logout({ refreshToken });
      }

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return res.json({ message: 'Logout successful' });
    } catch (err) {
      console.error('Logout Error:', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to logout' });
    }
  }

  // Forgot password endpoint
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword({ email });
  }

  // Reset password endpoint
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body);
  }

  // Reset password without OTP endpoint
  @Post('reset-without-otp')
  async resetPasswordWithoutOtp(
    @CurrentUser() user,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    const email = user.email;
    return this.authService.resetPasswordWithoutOtp({
      email,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  }
}
