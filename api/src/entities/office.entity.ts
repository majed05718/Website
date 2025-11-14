import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('offices')
export class Office {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  office_code: string;

  @Column()
  office_name: string;

  @Column({ type: 'int', default: 1000 })
  max_properties: number;

  @Column({ type: 'int', default: 50 })
  max_users: number;

  @Column({ default: 'free' })
  subscription_plan: string;

  @Column({ type: 'date', nullable: true })
  subscription_start: string;

  @Column({ type: 'date', nullable: true })
  subscription_end: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  whatsapp_phone_number: string;

  @Column({ type: 'varchar', nullable: true })
  whatsapp_phone_number_id: string;

  @Column({ type: 'text', nullable: true })
  whatsapp_api_url: string;

  @Column({ type: 'text', nullable: true })
  whatsapp_api_token: string;

  @Column({ type: 'text', nullable: true })
  n8n_webhook_url: string;

  @Column({ type: 'boolean', default: false })
  onboarding_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
