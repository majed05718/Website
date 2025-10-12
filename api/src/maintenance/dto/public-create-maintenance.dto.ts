import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PublicCreateMaintenanceDto {
  @IsOptional() @IsString() property_id?: string;
  @IsOptional() @IsString() title?: string; // عنوان بديل عند عدم توفر العقار

  @IsOptional() @IsString() tenant_phone?: string;
  @IsOptional() @IsString() tenant_name?: string;

  @IsNotEmpty() @IsString()
  issue_type!: string;

  @IsNotEmpty() @IsString()
  priority!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  before_images?: string[];
}
