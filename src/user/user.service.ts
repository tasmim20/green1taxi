/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateProfileRequest, CreateProfileResponse } from './user.interface';
import { UpdateProfileDto } from './dto/update.dto';

interface UserService {
  createProfile(
    request: CreateProfileRequest,
  ): Observable<CreateProfileResponse>;
  getProfile(request: { userId: number; role: string }): Observable<any>;
  updateProfile(
    userId: number,
    role: string,
    data: UpdateProfileDto,
  ): Observable<any>;
  deleteProfile(userId: number, role: string): Observable<any>;
}

@Injectable()
export class userService {
  private userService: UserService;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {
    this.userService = this.client.getService<UserService>('UserService');
  }

  createProfile(createProfileRequest: CreateProfileRequest) {
    return this.userService.createProfile(createProfileRequest);
  }

  getProfile(request: { userId: number; role: string }) {
    return this.userService.getProfile(request);
  }

  updateProfile(userId: number, role: string, data: UpdateProfileDto) {
    return this.userService.updateProfile(userId, role, data);
  }

  deleteProfile(userId: number, role: string) {
    return this.userService.deleteProfile(userId, role);
  }
}
