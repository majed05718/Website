import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  office_id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  property_code: string;

  @Column({ type: 'varchar' })
  property_type: string;

  @Column({ type: 'varchar' })
  listing_type: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'varchar', default: 'available' })
  status: string;

  @Index()
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', default: 'SAR' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area_sqm: number;

  @Column({ type: 'int', nullable: true })
  bedrooms: number;

  @Column({ type: 'int', nullable: true })
  bathrooms: number;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  location_city: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  location_district: string;

  @Column({ type: 'text', nullable: true })
  location_street: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  google_maps_link: string;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ type: 'jsonb', nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: true })
  featured_image: string;

  @Column({ type: 'int', default: 0 })
  image_count: number;

  @Column({ type: 'varchar', nullable: true })
  slug: string;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'varchar', nullable: true })
  contact_person: string;

  @Column({ type: 'varchar', nullable: true })
  contact_phone: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Composite index for tenant isolation and filtering
  @Index(['office_id', 'status'])
  composite_office_status?: void;

  @Index(['office_id', 'location_city'])
  composite_office_city?: void;

  @Index(['status', 'is_featured'])
  composite_status_featured?: void;
}
