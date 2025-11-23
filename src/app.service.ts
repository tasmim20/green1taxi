// src/auth/app.service.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// src/auth/auth.interface.ts
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  user: any; // You can customize this to match your user object
}

interface AuthService {
  Register(request: RegisterRequest): Observable<RegisterResponse>;
  // Add other methods like Login, ConfirmRegistration, etc.
}

@Injectable()
export class AppService implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    // Ensure the service name matches the one in your proto file (AuthService)
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.authService.Register(registerRequest);
  }
}
