// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  email: string;
  role: string;
  id: number; // optional, for user ID
  iat?: number;
  exp?: number;
}
