import { SetMetadata } from '@nestjs/common';

/**
 * Supported Application Roles
 * 
 * Role Hierarchy:
 * - SystemAdmin: Full system access, can manage all offices
 * - OfficeAdmin: Office-level admin, can manage office staff and data
 * - Manager: Office manager, can manage properties, contracts, and customers
 * - Staff: Regular office staff, limited access
 * - Accountant: Financial operations access
 * - Technician: Maintenance operations access
 * - Owner: Property owner (external user)
 * - Tenant: Property tenant (external user)
 */
export const ROLES_KEY = 'roles';
export type AppRole = 
  | 'system_admin'    // Full system access
  | 'office_admin'    // Office-level administrator
  | 'manager'         // Office manager
  | 'staff'           // Regular staff
  | 'accountant'      // Financial operations
  | 'technician'      // Maintenance operations
  | 'owner'           // Property owner
  | 'tenant';         // Property tenant

/**
 * Roles Decorator
 * 
 * Apply this decorator to controllers or methods to enforce role-based access control
 * 
 * @example
 * @Roles('office_admin', 'system_admin')
 * @Post('offices')
 * createOffice() { ... }
 */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
