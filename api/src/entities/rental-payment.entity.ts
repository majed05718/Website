import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rental_payments')
export class RentalPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index()
  @Column({ type: 'uuid' })
  contract_id: string;

  @Column({ type: 'uuid', nullable: true })
  property_id: string;

  @Index()
  @Column({ type: 'varchar' })
  tenant_phone: string;

  @Column({ type: 'varchar' })
  tenant_name: string;

  @Column({ type: 'varchar', unique: true })
  payment_number: string;

  @Index()
  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Index()
  @Column({ type: 'date' })
  due_date: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount_due: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount_paid: number;

  @Column({ type: 'date', nullable: true })
  paid_date: string;

  @Column({ type: 'varchar', nullable: true })
  payment_method: string;

  @Column({ type: 'varchar', nullable: true })
  payment_reference: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  office_commission: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  owner_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  collected_by: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for high-frequency queries
  @Index(['office_id', 'status'])
  composite_office_status?: void;

  @Index(['contract_id', 'status'])
  composite_contract_status?: void;

  @Index(['tenant_phone', 'status'])
  composite_tenant_status?: void;

  @Index(['due_date', 'status'])
  composite_due_status?: void;

  @Index(['office_id', 'due_date', 'status'])
  composite_office_due_status?: void;
}
