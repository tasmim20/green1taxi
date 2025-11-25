export type Role = 'RIDER' | 'DRIVER' | 'ADMIN';

export interface CreateProfileRequest {
  userId: number; // Rider.id / Driver.id / Admin.id
  email: string; //
  role: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
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
  bio?: string;
  address?: string;
}
export interface UserService {
  createProfile(payload: CreateProfileRequest): any;
  getProfile(payload: GetProfileRequest): any;
}
