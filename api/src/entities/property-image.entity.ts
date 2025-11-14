import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('property_images')
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  property_id: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'varchar', nullable: true })
  file_name: string;

  @Column({ type: 'int', nullable: true })
  file_size: number;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  // Composite index for efficient property image queries
  @Index(['property_id', 'display_order'])
  composite_property_order?: void;

  @Index(['property_id', 'is_featured'])
  composite_property_featured?: void;
}
