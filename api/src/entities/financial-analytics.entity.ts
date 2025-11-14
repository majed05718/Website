import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('financial_analytics')
export class FinancialAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index()
  @Column({ type: 'varchar' })
  report_period: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  expenses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  profit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  rental_income: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sales_income: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  commission_income: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  maintenance_expenses: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  operational_expenses: number;

  @Column({ type: 'int', default: 0 })
  active_contracts: number;

  @Column({ type: 'int', default: 0 })
  new_contracts: number;

  @Column({ type: 'int', default: 0 })
  terminated_contracts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  occupancy_rate: number;

  @Column({ type: 'jsonb', nullable: true })
  additional_metrics: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite indexes for analytics queries
  @Index(['office_id', 'report_period'])
  composite_office_period?: void;

  @Index(['office_id', 'year', 'month'])
  composite_office_year_month?: void;

  @Index(['report_period'])
  idx_report_period?: void;
}
