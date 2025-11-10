import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('payment_alerts')
export class PaymentAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index()
  @Column({ type: 'uuid' })
  contract_id: string;

  @Index()
  @Column({ type: 'uuid' })
  payment_id: string;

  @Index()
  @Column({ type: 'varchar' })
  alert_type: string;

  @Column({ type: 'int' })
  alert_level: number;

  @Column({ type: 'date' })
  due_date: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'int', nullable: true })
  days_overdue: number;

  @Index()
  @Column({ type: 'boolean', default: false })
  is_sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  channel: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for alert queries
  @Index(['office_id', 'is_sent'])
  composite_office_sent?: void;

  @Index(['payment_id', 'alert_type'])
  composite_payment_type?: void;

  @Index(['contract_id', 'is_sent'])
  composite_contract_sent?: void;

  @Index(['alert_type', 'is_sent', 'created_at'])
  composite_type_sent_date?: void;
}
