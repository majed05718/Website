import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'kpi_tracking' })
export class KpiTracking {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'office_id', type: 'varchar' }) officeId!: string;
  @Index() @Column({ name: 'kpi_name', type: 'varchar' }) kpiName!: string;
  @Column({ name: 'current_value', type: 'numeric', precision: 14, scale: 2, default: 0 }) currentValue!: string;
  @Column({ name: 'target_value', type: 'numeric', precision: 14, scale: 2, default: 0 }) targetValue!: string;
  @Index() @Column({ name: 'report_period', type: 'varchar', nullable: true }) reportPeriod!: string | null; // YYYY-MM
}
