import { IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LinkPropertyDto {
  @ApiProperty({ example: 'uuid-property-id', description: 'معرف العقار' })
  @IsUUID()
  property_id: string;

  @ApiProperty({ enum: ['owner', 'interested', 'viewed', 'negotiating', 'contracted'], example: 'interested', description: 'نوع العلاقة' })
  @IsEnum(['owner', 'interested', 'viewed', 'negotiating', 'contracted'])
  relationship: string;

  @ApiPropertyOptional({ example: '2025-10-20T10:00:00Z', description: 'تاريخ البداية' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z', description: 'تاريخ النهاية' })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}
