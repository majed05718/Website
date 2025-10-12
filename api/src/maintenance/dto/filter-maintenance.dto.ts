import { IsOptional, IsString } from 'class-validator';

export class FilterMaintenanceDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() issue_type?: string;
  @IsOptional() @IsString() property_id?: string;
  @IsOptional() @IsString() tenant_phone?: string;
  @IsOptional() @IsString() assigned_technician?: string;
}
