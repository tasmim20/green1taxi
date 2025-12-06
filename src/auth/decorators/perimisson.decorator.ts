import { SetMetadata } from '@nestjs/common';
import { FieldPermission } from '../guards/PremissionsGuard';

export const Permissions = (permissions: FieldPermission[]) =>
  SetMetadata('permissions', permissions);
