import { IsArray, IsDateString, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdateMaintenanceDto {
  @IsOptional() @IsString() status?: 'new' | 'in_progress' | 'completed' | 'closed';
  @IsOptional() @IsString() assigned_technician?: string;
  @IsOptional() @IsString() technician_name?: string;
  @IsOptional() @IsDateString() scheduled_date?: string;
  @IsOptional() @IsNumberString() estimated_cost?: string;
  @IsOptional() @IsNumberString() actual_cost?: string;
  @IsOptional() @IsString() who_pays?: 'tenant' | 'owner' | 'office' | 'split';
  @IsOptional() @IsArray() @IsString({ each: true }) before_images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) after_images?: string[];
  @IsOptional() @IsString() technician_notes?: string;
}
