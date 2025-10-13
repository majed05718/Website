import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PropertyImage } from './property-image.entity';

// كيان العقارات
@Entity({ name: 'properties' })
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'office_id', type: 'varchar' })
  officeId!: string;

  @Index({ unique: true })
  @Column({ name: 'property_code', type: 'varchar' })
  propertyCode!: string;

  @Column({ name: 'property_type', type: 'varchar' })
  propertyType!: string; // apartment, villa, land, ...

  @Column({ name: 'listing_type', type: 'varchar' })
  listingType!: string; // sale, rent

  @Index()
  @Column({ name: 'location_city', type: 'varchar', nullable: true })
  locationCity!: string | null;

  @Index()
  @Column({ name: 'location_district', type: 'varchar', nullable: true })
  locationDistrict!: string | null;

  @Column({ name: 'location_street', type: 'varchar', nullable: true })
  locationStreet!: string | null;

  @Index()
  @Column({ name: 'price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  price!: string | null;

  @Column({ name: 'currency', type: 'varchar', length: 3, nullable: true })
  currency!: string | null; // SAR, USD, ...

  @Index()
  @Column({ name: 'area_sqm', type: 'numeric', precision: 12, scale: 2, nullable: true })
  areaSqm!: string | null;

  @Index()
  @Column({ name: 'bedrooms', type: 'int', nullable: true })
  bedrooms!: number | null;

  @Index()
  @Column({ name: 'bathrooms', type: 'int', nullable: true })
  bathrooms!: number | null;

  @Column({ name: 'features', type: 'jsonb', nullable: true })
  features!: Record<string, any> | null;

  @Column({ name: 'title', type: 'varchar' })
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'images', type: 'text', array: true, nullable: true })
  images!: string[] | null;

  @Index()
  @Column({ name: 'status', type: 'varchar', default: 'available' })
  status!: string; // available, pending, sold, rented, deleted

  @Column({ name: 'contact_person', type: 'varchar', nullable: true })
  contactPerson!: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', nullable: true })
  contactPhone!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'featured_image', type: 'text', nullable: true })
  featuredImage!: string | null;

  @Column({ name: 'image_count', type: 'int', default: 0 })
  imageCount!: number;

  @Column({ name: 'google_maps_link', type: 'text', nullable: true })
  googleMapsLink!: string | null;

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 6, nullable: true })
  latitude!: string | null;

  @Column({ name: 'longitude', type: 'numeric', precision: 10, scale: 6, nullable: true })
  longitude!: string | null;

  @Index({ unique: true })
  @Column({ name: 'slug', type: 'varchar' })
  slug!: string;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @OneToMany(() => PropertyImage, (img) => img.property, { cascade: true })
  imagesRel!: PropertyImage[];
}
