import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from './properties.entity';

// كيان صور العقارات
@Entity({ name: 'property_images' })
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @ManyToOne(() => Property, (p) => p.imagesRel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl!: string;

  @Column({ name: 'file_name', type: 'varchar', nullable: true })
  fileName!: string | null;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;

  @CreateDateColumn({ name: 'upload_date', type: 'timestamptz' })
  uploadDate!: Date;

  @Column({ name: 'uploaded_by', type: 'varchar', nullable: true })
  uploadedBy!: string | null; // user_id

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;
}
