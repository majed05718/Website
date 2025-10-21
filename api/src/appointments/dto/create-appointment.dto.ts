import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsNumber } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty() @IsEnum(['viewing', 'meeting', 'contract_signing', 'handover', 'inspection', 'other']) type: string;
  @ApiProperty() @IsString() @IsNotEmpty() date: string;
  @ApiProperty() @IsString() @IsNotEmpty() startTime: string;
  @ApiProperty() @IsString() @IsNotEmpty() endTime: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() duration?: number;
  @ApiPropertyOptional() @IsUUID() @IsOptional() propertyId?: string;
  @ApiPropertyOptional() @IsUUID() @IsOptional() customerId?: string;
  @ApiProperty() @IsUUID() @IsNotEmpty() assignedStaffId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() location?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() meetingLink?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
}
