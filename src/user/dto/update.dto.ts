// // src/user/dto/update-profile.dto.ts
// import { IsOptional, IsString } from 'class-validator';

// export class UpdateProfileDto {
//   @IsOptional()
//   @IsString()
//   firstName?: string;

//   @IsOptional()
//   @IsString()
//   lastName?: string;

//   @IsOptional()
//   @IsString()
//   mobileNumber?: string;

//   @IsOptional()
//   @IsString()
//   profilePhoto?: string;

//   @IsOptional()
//   @IsString()
//   bio?: string;

//   @IsOptional()
//   @IsString()
//   address?: string;
// }
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
