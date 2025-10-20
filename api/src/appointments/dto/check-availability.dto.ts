import { IsDateString, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty({ example: '2025-10-20', description: 'التاريخ' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00:00', description: 'وقت البداية' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '11:00:00', description: 'وقت النهاية' })
  @IsString()
  end_time: string;

  @ApiProperty({ example: 'uuid-staff-id', description: 'معرف الموظف' })
  @IsUUID()
  assigned_staff_id: string;
}
