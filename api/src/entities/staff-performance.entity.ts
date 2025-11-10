import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('staff_performance')
export class StaffPerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index()
  @Column({ type: 'varchar' })
  staff_phone: string;

  @Column({ type: 'varchar' })
  staff_name: string;

  @Index()
  @Column({ type: 'varchar' })
  report_period: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int', default: 0 })
  deals_closed: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue_generated: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  commission_earned: number;

  @Column({ type: 'int', default: 0 })
  properties_managed: number;

  @Column({ type: 'int', default: 0 })
  new_customers: number;

  @Column({ type: 'int', default: 0 })
  appointments_completed: number;

  @Column({ type: 'int', default: 0 })
  appointments_cancelled: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  customer_satisfaction: number;

  @Column({ type: 'int', default: 0 })
  response_time_avg: number;

  @Column({ type: 'jsonb', nullable: true })
  performance_metrics: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for performance queries
  @Index(['office_id', 'report_period'])
  composite_office_period?: void;

  @Index(['staff_phone', 'report_period'])
  composite_staff_period?: void;

  @Index(['office_id', 'year', 'month'])
  composite_office_year_month?: void;

  @Index(['revenue_generated'])
  idx_revenue_generated?: void;
}
