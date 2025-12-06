import { Observable } from 'rxjs';

export type Role = 'RIDER' | 'DRIVER' | 'ADMIN';

export interface CreateProfileRequest {
  userId: number; // Rider.id / Driver.id / Admin.id
  email: string; //
  role: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  mobileNumber?: string;
  bio?: string;
  address?: string;
}

export interface CreateProfileResponse {
  success: boolean;
  message: string;
  profileId: number;
}

export interface GetProfileRequest {
  userId: number; // auth-service user id
  role: string;
}

export interface GetProfileResponse {
  profileId: number;
  userId: number; // auth-service user id
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePhoto?: string;
  mobileNumber?: string;
  bio?: string;
  address?: string;
}
export interface UpdateProfileRequest {
  userId: number;
  role: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  mobileNumber?: string;
  bio?: string;
  address?: string;
}
export interface DeleteProfileRequest {
  userId: number;
  role: string;
}

// export interface UserService {
//   createProfile(data: CreateProfileRequest): Promise<CreateProfileResponse>;
//   getProfile(data: {
//     userId: number;
//     role: string;
//   }): Promise<GetProfileResponse | null>;

//   // Add updateProfile method
//   updateProfile(
//     userId: number,
//     role: string,
//     updateData: Partial<
//       Omit<CreateProfileRequest, 'role' | 'email' | 'userId'>
//     >,
//   ): Promise<GetProfileResponse>;

//   // Add deleteProfile method
//   deleteProfile(
//     userId: number,
//     role: string,
//   ): Promise<{ success: boolean; message: string }>;
// }
export interface UserService {
  createProfile(
    request: CreateProfileRequest,
  ): Observable<CreateProfileResponse>;
  updateProfile(request: UpdateProfileRequest): Observable<GetProfileResponse>;
  deleteProfile(
    request: DeleteProfileRequest,
  ): Observable<{ success: boolean; message: string }>;
  getProfile(request: GetProfileRequest): Observable<GetProfileResponse>;
}
