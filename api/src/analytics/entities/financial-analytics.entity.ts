import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'financial_analytics' })
export class FinancialAnalytics {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'office_id', type: 'varchar' }) officeId!: string;
  @Index() @Column({ name: 'report_period', type: 'varchar' }) reportPeriod!: string; // YYYY-MM
  @Column({ name: 'revenue', type: 'numeric', precision: 14, scale: 2, default: 0 }) revenue!: string;
  @Column({ name: 'expenses', type: 'numeric', precision: 14, scale: 2, default: 0 }) expenses!: string;
  @Column({ name: 'profit', type: 'numeric', precision: 14, scale: 2, default: 0 }) profit!: string;
}
