import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'offices' })
export class Office {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'office_code', type: 'varchar' })
  officeCode!: string;

  @Column({ name: 'office_name', type: 'varchar' })
  officeName!: string;

  // إعدادات واتساب
  @Column({ name: 'whatsapp_api_token', type: 'text', nullable: true })
  whatsappApiToken!: string | null; // مخزن بشكل مُشفّر

  @Column({ name: 'whatsapp_api_url', type: 'text', nullable: true })
  whatsappApiUrl!: string | null;

  @Column({ name: 'whatsapp_phone_number', type: 'varchar', nullable: true })
  whatsappPhoneNumber!: string | null; // display number

  @Column({ name: 'whatsapp_phone_number_id', type: 'varchar', nullable: true })
  whatsappPhoneNumberId!: string | null; // Meta phone_number_id

  // خطة الاشتراك والقيود
  @Column({ name: 'subscription_plan', type: 'varchar', nullable: true })
  subscriptionPlan!: string | null;

  @Column({ name: 'max_properties', type: 'int', default: 1000 })
  maxProperties!: number;

  @Column({ name: 'max_users', type: 'int', default: 50 })
  maxUsers!: number;

  @Column({ name: 'onboarding_completed', type: 'boolean', default: false })
  onboardingCompleted!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
