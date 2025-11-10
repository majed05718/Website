import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rental_contracts')
export class RentalContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  contract_number: string;

  @Index()
  @Column({ type: 'uuid' })
  property_id: string;

  @Index()
  @Column({ type: 'varchar' })
  tenant_phone: string;

  @Column({ type: 'varchar' })
  tenant_name: string;

  @Column({ type: 'varchar', nullable: true })
  tenant_national_id: string;

  @Column({ type: 'text', nullable: true })
  tenant_address: string;

  @Index()
  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Index()
  @Column({ type: 'date' })
  start_date: string;

  @Index()
  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'int' })
  duration_months: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthly_rent: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  deposit_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  office_commission_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  office_commission_amount: number;

  @Column({ type: 'varchar', default: 'monthly' })
  payment_frequency: string;

  @Column({ type: 'int', default: 1 })
  payment_day_of_month: number;

  @Column({ type: 'text', nullable: true })
  special_terms: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'timestamp', nullable: true })
  signed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  terminated_at: Date;

  @Column({ type: 'text', nullable: true })
  termination_reason: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for efficient queries
  @Index(['office_id', 'status'])
  composite_office_status?: void;

  @Index(['property_id', 'status'])
  composite_property_status?: void;

  @Index(['tenant_phone', 'status'])
  composite_tenant_status?: void;

  @Index(['start_date', 'end_date'])
  composite_date_range?: void;
}
