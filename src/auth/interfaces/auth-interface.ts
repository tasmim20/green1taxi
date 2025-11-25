import { Role } from '../dto/role.enum';

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
