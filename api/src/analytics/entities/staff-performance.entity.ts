import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'staff_performance' })
export class StaffPerformance {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'office_id', type: 'varchar' }) officeId!: string;
  @Index() @Column({ name: 'staff_phone', type: 'varchar' }) staffPhone!: string;
  @Index() @Column({ name: 'report_period', type: 'varchar' }) reportPeriod!: string; // YYYY-MM
  @Column({ name: 'tasks_completed', type: 'int', default: 0 }) tasksCompleted!: number;
  @Column({ name: 'revenue_generated', type: 'numeric', precision: 14, scale: 2, default: 0 }) revenueGenerated!: string;
  @Column({ name: 'customer_satisfaction', type: 'numeric', precision: 5, scale: 2, default: 0 }) customerSatisfaction!: string; // 0-100
}
