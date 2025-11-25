/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpStatus,
  HttpException,
  OnModuleInit,
  Inject,
  UseGuards,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response, Request } from 'express';
import { LoginDto } from './auth/dto/login.dto';
import { Role } from './auth/dto/role.enum';
import type {
  CreateProfileRequest,
  CreateProfileResponse,
  GetProfileResponse,
  UserService,
} from './user/user.interface';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthResponse, AuthService } from './auth/interfaces/auth-interface';

@Controller()
export class AppController implements OnModuleInit {
  private authService: AuthService;
  private userService: UserService;
  getHello: any;

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientGrpc,
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.authClient.getService<AuthService>('AuthService');
    this.userService = this.userClient.getService<UserService>('UserService');
  }

  // ----------------- Auth Endpoints -----------------
  @Post('auth/register')
  async register(@Body() createUserDto: any) {
    if (!createUserDto || !createUserDto.role) {
      throw new HttpException(
        'Invalid registration data',
        HttpStatus.BAD_REQUEST,
      );
    }
    createUserDto.role = createUserDto.role as Role;
    return firstValueFrom(this.authService.Register(createUserDto));
  }

  @Post('auth/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result: AuthResponse = await firstValueFrom(
      this.authService.Login(loginDto),
    );
    if (result?.status === 'error')
      return res.status(HttpStatus.BAD_REQUEST).json(result);

    const { accessToken, refreshToken, role } = result;
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, refreshToken, role });
  }

  @Get('auth/confirm')
  async confirmEmail(@Query('token') token: string) {
    return firstValueFrom(this.authService.ConfirmRegistration({ token }));
  }

  @Post('auth/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers['authorization'];
    let refreshToken: string | undefined;
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      refreshToken = authHeader.slice('Bearer '.length);
    } else {
      refreshToken = req.cookies?.refresh_token;
    }
    if (!refreshToken)
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No token' });

    const result: AuthResponse = await firstValueFrom(
      this.authService.RefreshToken({ refreshToken }),
    );
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  @Post('auth/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'No refresh token found' });

    try {
      await firstValueFrom(this.authService.Logout({ refreshToken }));
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
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

  @Post('auth/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return firstValueFrom(this.authService.ForgotPassword({ email }));
  }

  @Post('auth/reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    return firstValueFrom(this.authService.ResetPassword(body));
  }

  // ----------------- User Endpoints -----------------
  @Post('user/create')
  async createUserProfile(@Body() body: CreateProfileRequest) {
    try {
      const response: CreateProfileResponse = await firstValueFrom(
        this.userService.createProfile(body),
      );
      return response;
    } catch (err) {
      console.error('UserService CreateProfile Error:', err);
      throw new HttpException(
        'Failed to create profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/profile')
  async getUserProfile(
    @Query('userId') userId: string,
    @Query('role') role: string,
  ): Promise<GetProfileResponse> {
    // decoded from token

    const request = { userId: Number(userId), role };

    try {
      const profile = await this.userService.getProfile(request);
      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }
      return profile;
    } catch {
      throw new HttpException(
        'Failed to fetch profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
