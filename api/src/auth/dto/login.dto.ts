import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @Matches(/^5[0-9]{8}$/, { message: 'رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام' })
  @IsNotEmpty({ message: 'رقم الجوال مطلوب' })
  phone: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password: string;
}
