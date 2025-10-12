import { SetMetadata } from '@nestjs/common';

// Decorator للأدوار المدعومة
export const ROLES_KEY = 'roles';
export type AppRole = 'manager' | 'staff' | 'technician' | 'accountant' | 'owner' | 'tenant';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
