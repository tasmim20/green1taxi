/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../dto/role.enum';

export interface FieldPermission {
  field: string;
  allowedRoles: Role[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions: FieldPermission[] = this.reflector.get<
      FieldPermission[]
    >('permissions', context.getHandler());

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: { id: number; role: Role } = request.user;

    for (const permission of requiredPermissions) {
      if (permission.field in request.body) {
        if (!permission.allowedRoles.includes(user.role)) {
          throw new ForbiddenException(
            `You do not have permission to update field: ${permission.field}`,
          );
        }
      }
    }

    return true;
  }
}
