import { IsArray, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CompleteMaintenanceDto {
  @IsNotEmpty() @IsNumberString() actual_cost!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) after_images?: string[];
  @IsOptional() @IsString() technician_notes?: string;
  @IsOptional() @IsNumberString() tenant_rating?: string;
  @IsOptional() @IsString() tenant_feedback?: string;
}
