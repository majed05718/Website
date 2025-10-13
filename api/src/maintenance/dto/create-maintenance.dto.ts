import { IsArray, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export type IssueType = 'plumbing' | 'electrical' | 'ac' | 'appliance' | 'other';
export type PriorityType = 'low' | 'medium' | 'high' | 'urgent';

export class CreateMaintenanceDto {
  @IsOptional() @IsString() property_id?: string;
  @IsOptional() @IsString() tenant_phone?: string;
  @IsOptional() @IsString() tenant_name?: string;

  @IsNotEmpty() @IsString() @Length(2, 100)
  issue_type!: IssueType;

  @IsNotEmpty() @IsString()
  priority!: PriorityType;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  before_images?: string[];
}
