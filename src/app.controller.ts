/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  Res,
  Req,
  HttpStatus,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response, Request } from 'express';
import { LoginDto } from './auth/dto/login.dto';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { Role } from './auth/dto/role.enum';

interface AuthResponse {
  accessToken: string;
  newRefreshToken?: string;
  refreshToken?: string;
  role: Role;
  status?: string;
}

interface AuthenticatedUserSafe {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  role: Role;
  isConfirmed?: boolean;
  drivingLicense?: string;
  name?: string; // for admin
}

@Controller('auth')
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get()
  getHello() {
    return { message: '.' };
  }

  @Post('register')
  async register(@Body() createUserDto: any) {
    if (!createUserDto || !createUserDto.role) {
      throw new HttpException(
        'Invalid registration data',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      // Ensure role enum matches microservice Role
      createUserDto.role = createUserDto.role as Role;

      return await firstValueFrom(
        this.authClient.send({ cmd: 'register' }, createUserDto),
      );
    } catch (err) {
      console.error('Microservice register error:', err);
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result: AuthResponse = await firstValueFrom(
      this.authClient.send({ cmd: 'login' }, loginDto),
    );

    if (result?.status === 'error') {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }

    const { accessToken, refreshToken, role } = result;

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, role, refreshToken });
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'confirm-registration' }, token),
    );
  }
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    // 1) try header
    const auth = req.headers['authorization'];
    let refreshToken: string | undefined;

    if (auth && auth.startsWith('Bearer ')) {
      refreshToken = auth.slice('Bearer '.length);
    } else {
      // 2) fallback to cookie
      refreshToken = req.cookies?.refresh_token;
    }

    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No token' });
    }

    // 3) send EXACT token to microservice
    const result: AuthResponse = await firstValueFrom(
      this.authClient.send({ cmd: 'refresh' }, { refreshToken }),
    );

    // 4) rotate cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No refresh token found' });

      await firstValueFrom(
        this.authClient.send({ cmd: 'logout' }, { refreshToken }),
      );

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

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'forgot-password' }, email),
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'reset-password' }, body),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<AuthenticatedUserSafe> {
    const { id, role } = req.user; // Get userId and role from the JWT payload

    if (!id || !role) {
      throw new HttpException('Invalid user data', HttpStatus.UNAUTHORIZED); // Ensure userId and role exist
    }

    try {
      // Fetch user profile from microservice using userId and role
      const user = await firstValueFrom(
        this.authClient.send({ cmd: 'profile' }, { userId: id, role }), // Ensure correct communication pattern
      );

      if (!user) {
        throw new HttpException('User profile not found', HttpStatus.NOT_FOUND); // If user profile is not found
      }

      return user; // Return the user profile
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new HttpException(
        'Failed to fetch profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ); // Error handling
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('riders')
  async getAllRiders(): Promise<AuthenticatedUserSafe[]> {
    return firstValueFrom(this.authClient.send({ cmd: 'riders' }, {}));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('drivers')
  async getAllDrivers(): Promise<AuthenticatedUserSafe[]> {
    return firstValueFrom(this.authClient.send({ cmd: 'drivers' }, {}));
  }

  @UseGuards(JwtAuthGuard)
  @Get('rider')
  async getRiderByEmail(@Req() req: any, @Query('email') email: string) {
    const loggedInUser = req.user;

    if (loggedInUser.role !== Role.ADMIN && loggedInUser.email !== email) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return firstValueFrom(this.authClient.send({ cmd: 'rider/email' }, email));
  }

  @UseGuards(JwtAuthGuard)
  @Get('driver')
  async getDriverByEmail(@Req() req: any, @Query('email') email: string) {
    const loggedInUser = req.user;

    if (loggedInUser.role !== Role.ADMIN && loggedInUser.email !== email) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return firstValueFrom(this.authClient.send({ cmd: 'driver/email' }, email));
  }
}
