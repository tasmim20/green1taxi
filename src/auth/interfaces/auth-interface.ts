// import { Role } from '../dto/role.enum';

// export interface AuthResponse {
//   accessToken: string;
//   refreshToken?: string;
//   role: Role;
//   status?: string;
// }

// // ---------------- gRPC Auth Service ----------------
// export interface AuthService {
//   Register(payload: any): any;
//   Login(payload: { email: string; password: string }): any;
//   ConfirmRegistration(payload: { token: string }): any;
//   RefreshToken(payload: { refreshToken: string }): any;
//   Logout(payload: { refreshToken: string }): any;
//   ForgotPassword(payload: { email: string }): any;
//   ResetPassword(payload: {
//     email: string;
//     otp: string;
//     newPassword: string;
//   }): any;
//   ResetPasswordWithoutOtp(data: {
//     email: string;
//     currentPassword: string;
//     newPassword: string;
//   }): any;
// }

/* eslint-disable prettier/prettier */
import { Role } from '../dto/role.enum';

// Auth response definition
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  role: Role;
  status?: string;
}

// ---------------- gRPC Auth Service ----------------
export interface AuthService {
  Register(payload: any): any; // You can replace 'any' with a more specific type later if you want
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
  ResetPasswordWithoutOtp(data: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }): any;
}
