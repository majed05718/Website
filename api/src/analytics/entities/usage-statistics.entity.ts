import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usage_statistics' })
export class UsageStatistics {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'office_id', type: 'varchar' }) officeId!: string;
  @Index() @Column({ name: 'metric_name', type: 'varchar' }) metricName!: string;
  @Column({ name: 'metric_value', type: 'numeric', precision: 14, scale: 2, default: 0 }) metricValue!: string;
  @Index() @Column({ name: 'report_period', type: 'varchar', nullable: true }) reportPeriod!: string | null; // YYYY-MM or YYYY-MM-DD
}
