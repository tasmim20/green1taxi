// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-return */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/await-thenable */
// import {
//   Controller,
//   Post,
//   Body,
//   Get,
//   Patch,
//   Delete,
//   UseGuards,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// import { UpdateProfileDto } from './dto/update.dto';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import type { CreateProfileRequest, UserService } from './user.interface';

// @Controller('user')
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Post('create')
//   async createUserProfile(@Body() body: CreateProfileRequest) {
//     try {
//       const response = await this.userService.createProfile(body);
//       return response;
//     } catch (err) {
//       console.error('UserService CreateProfile Error:', err);
//       throw new HttpException(
//         'Failed to create profile',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get('profile/me')
//   async getUserProfile(@CurrentUser() user) {
//     const request = { userId: Number(user.id), role: user.role };
//     const profile = await this.userService.getProfile(request);

//     if (!profile) {
//       throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
//     }

//     return profile;
//   }

//   @UseGuards(JwtAuthGuard)
//   @Patch('profile/update')
//   async updateUserProfile(@CurrentUser() user, @Body() body: UpdateProfileDto) {
//     try {
//       const updatedProfile = await this.userService.updateProfile(
//         Number(user.id),
//         user.role,
//         body,
//       );
//       return updatedProfile;
//     } catch (err) {
//       console.error('UserService UpdateProfile Error:', err);
//       throw new HttpException(
//         'Failed to update profile',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   @UseGuards(JwtAuthGuard)
//   @Delete('profile/delete')
//   async deleteUserProfile(@CurrentUser() user) {
//     try {
//       const result = await this.userService.deleteProfile(
//         Number(user.id),
//         user.role,
//       );
//       return result;
//     } catch (err) {
//       console.error('UserService DeleteProfile Error:', err);
//       throw new HttpException(
//         'Failed to delete profile',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
// }
