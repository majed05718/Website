import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'owner_reports' })
export class OwnerReports {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Index() @Column({ name: 'office_id', type: 'varchar' }) officeId!: string;
  @Index() @Column({ name: 'owner_id', type: 'varchar' }) ownerId!: string;
  @Index() @Column({ name: 'report_period', type: 'varchar' }) reportPeriod!: string; // YYYY-MM
  @Column({ name: 'total_properties', type: 'int', default: 0 }) totalProperties!: number;
  @Column({ name: 'occupied_properties', type: 'int', default: 0 }) occupiedProperties!: number;
  @Column({ name: 'revenue', type: 'numeric', precision: 14, scale: 2, default: 0 }) revenue!: string;
}
