/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
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
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response, Request } from 'express';
import { UpdateProfileDto } from './user/dto/update.dto';
import { LoginDto } from './auth/dto/login.dto';
import { Role } from './auth/dto/role.enum';
import type {
  CreateProfileRequest,
  CreateProfileResponse,
  DeleteProfileRequest,
  GetProfileResponse,
  UserService,
} from './user/user.interface';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthResponse, AuthService } from './auth/interfaces/auth-interface';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { PermissionsGuard } from './auth/guards/PremissionsGuard';
import { Permissions } from './auth/decorators/perimisson.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCloudinaryOptions } from './cloudinary/multer-cloudinary';

const Roles = {
  RIDER: 'RIDER' as Role,
  DRIVER: 'DRIVER' as Role,
  ADMIN: 'ADMIN' as Role,
};

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
  @UseInterceptors(FileInterceptor('photo', multerCloudinaryOptions))
  async register(
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Body() createUserDto: any,
  ) {
    // console.log('photo:', photo); // check if file is received
    // console.log('body:', createUserDto);

    if (!createUserDto || !createUserDto.role) {
      throw new HttpException(
        'Invalid registration data',
        HttpStatus.BAD_REQUEST,
      );
    }
    createUserDto.role = createUserDto.role as Role;
    // Safely assign profilePhoto
    if (photo) {
      createUserDto.profilePhoto = photo.path;
    }
    console.log('DTO before gRPC call:', createUserDto); // check it
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
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    });

    return res.json({ accessToken, refreshToken, role });
  }

  @Post('auth/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      // 1) Use ONLY the cookie for refresh token
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Refresh token missing' });
      }

      // 2) Call gRPC with the REAL refresh token
      const result: AuthResponse = await firstValueFrom(
        this.authService.RefreshToken({ refreshToken }),
      );

      if (!result || !result.accessToken || !result.refreshToken) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid refresh token' });
      }

      // 3) Rotate: set new refresh token cookie
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      });

      // 4) Send new access token to frontend
      return res.json({
        accessToken: result.accessToken,
        // you can omit refreshToken here for security if you want
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      console.error('❌ Failed to refresh token:', err);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Failed to refresh token',
        error: err instanceof Error ? err.message : err,
      });
    }
  }

  @Get('auth/confirm')
  async confirmEmail(@Query('token') token: string) {
    return firstValueFrom(this.authService.ConfirmRegistration({ token }));
  }

  @Post('auth/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    // Always try to logout, even if cookie is missing
    try {
      if (refreshToken) {
        // Revoke all refresh tokens for the user
        await firstValueFrom(this.authService.Logout({ refreshToken }));
      }

      // Clear cookie in browser
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
  @UseGuards(JwtAuthGuard)
  @Post('auth/reset-without-otp')
  async resetPasswordWithoutOtp(
    @CurrentUser() user,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    const email = user.email; // Force email from logged-in user
    return firstValueFrom(
      this.authService.ResetPasswordWithoutOtp({
        email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    );
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
  @Get('user/profile/me')
  async getMyProfile(
    @CurrentUser() user: { id: number; role: Role },
  ): Promise<GetProfileResponse> {
    try {
      const profile = await firstValueFrom(
        this.userService.getProfile({ userId: user.id, role: user.role }),
      );

      if (!profile) {
        throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
      }

      return profile;
    } catch (err) {
      console.error('UserService GetProfile Error:', err);
      throw new HttpException(
        'Failed to fetch profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch('user/profile/update')
  @UseInterceptors(FileInterceptor('profilePhoto', multerCloudinaryOptions))
  async updateUserProfile(
    @CurrentUser() user: { id: number; role: Role },
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: any,
  ) {
    // Only assign new photo if uploaded
    let profilePhotoToUpdate: string | undefined = undefined;
    if (file) {
      console.log('Uploaded file:', file); // check file.path
      profilePhotoToUpdate = file.path; // Cloudinary URL
    }

    const payload: any = {
      firstName: body.firstName ?? undefined,
      lastName: body.lastName ?? undefined,
      mobileNumber: body.mobileNumber ?? undefined,
      bio: body.bio ?? undefined,
      address: body.address ?? undefined,
    };

    // Only add profilePhoto if a new file exists
    if (profilePhotoToUpdate) {
      payload.profilePhoto = profilePhotoToUpdate;
    }

    console.log('Payload sent to userService:', payload);

    const updatedProfile = await firstValueFrom(
      this.userService.updateProfile({
        userId: user.id,
        role: user.role,
        ...payload,
      }),
    );

    console.log('Updated profile from user-service:', updatedProfile);

    return updatedProfile;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/profile/delete')
  async deleteUserProfile(@CurrentUser() user) {
    try {
      const response = await firstValueFrom(
        this.userService.deleteProfile({
          userId: Number(user.id),
          role: user.role,
        } as DeleteProfileRequest),
      );
      return response;
    } catch (err) {
      console.error('UserService DeleteProfile Error:', err);
      throw new HttpException(
        'Failed to delete profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
