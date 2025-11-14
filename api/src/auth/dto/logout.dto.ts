import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsString({ message: 'رمز التحديث يجب أن يكون نصاً' })
  refreshToken?: string;

  @IsOptional()
  @IsString()
  logoutFrom?: 'current' | 'all';
}
