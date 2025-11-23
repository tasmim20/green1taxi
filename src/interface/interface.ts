import { Role } from 'src/auth/dto/role.enum';
import {
  CreateProfileRequest,
  GetProfileRequest,
} from 'src/user/user.interface';

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  role: Role;
  status?: string;
}

// ---------------- gRPC Auth Service ----------------
export interface AuthService {
  Register(payload: any): any;
  Login(payload: { email: string; password: string }): any;
  ConfirmRegistration(payload: { token: string }): any;
  RefreshToken(payload: { refreshToken: string }): any;
  Logout(payload: { refreshToken: string }): any;
  ForgotPassword(payload: { email: string }): any;
  ResetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): any;
}

// ---------------- gRPC User Service ----------------
export interface UserService {
  createProfile(payload: CreateProfileRequest): any;
  getProfile(payload: GetProfileRequest): any;
}
