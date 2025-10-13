import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere, In, Not } from 'typeorm';
import { Property } from './properties.entity';
import { PropertyImage } from './property-image.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property) private readonly propertiesRepo: Repository<Property>,
    @InjectRepository(PropertyImage) private readonly imagesRepo: Repository<PropertyImage>,
  ) {}

  async findAll(officeId: string, filters: FilterPropertiesDto) {
    const where: FindOptionsWhere<Property> = { officeId };

    if (filters.type) where.propertyType = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.city) where.locationCity = filters.city;
    if (filters.district) where.locationDistrict = filters.district;
    if (typeof filters.is_featured === 'boolean') where.isFeatured = filters.is_featured;

    if (filters.min_price || filters.max_price) {
      const min = filters.min_price ? Number(filters.min_price) : 0;
      const max = filters.max_price ? Number(filters.max_price) : Number.MAX_SAFE_INTEGER;
      (where as any).price = Between(min, max);
    }

    if (filters.min_area || filters.max_area) {
      const min = filters.min_area ? Number(filters.min_area) : 0;
      const max = filters.max_area ? Number(filters.max_area) : Number.MAX_SAFE_INTEGER;
      (where as any).areaSqm = Between(min, max);
    }

    if (typeof filters.bedrooms === 'number') where.bedrooms = filters.bedrooms;
    if (typeof filters.bathrooms === 'number') where.bathrooms = filters.bathrooms;

    const order: any = {};
    const orderBy = filters.order_by ?? 'created_at';
    const orderDir = (filters.order ?? 'desc').toUpperCase();
    if (orderBy === 'created_at') order.createdAt = orderDir;
    if (orderBy === 'price') order.price = orderDir;
    if (orderBy === 'area') order.areaSqm = orderDir;

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await this.propertiesRepo.findAndCount({
      where: [
        {
          ...where,
          ...(filters.search
            ? {
                title: ILike(`%${filters.search}%`),
              }
            : {}),
        },
        {
          ...where,
          ...(filters.search
            ? {
                description: ILike(`%${filters.search}%`),
              }
            : {}),
        },
      ],
      order,
      skip,
      take: limit,
      relations: ['imagesRel'],
    });

    return { items, total, page, limit };
  }

  async findOneWithImages(officeId: string, id: string) {
    const property = await this.propertiesRepo.findOne({ where: { id, officeId }, relations: ['imagesRel'] });
    if (!property) throw new NotFoundException('العقار غير موجود');
    return property;
  }

  async create(officeId: string, userId: string, dto: CreatePropertyDto) {
    // تحقق من uniqueness لرمز العقار
    const exists = await this.propertiesRepo.exists({ where: { propertyCode: dto.property_code } as any });
    if (exists) throw new BadRequestException('رمز العقار مستخدم مسبقاً');

    const entity = this.propertiesRepo.create({
      officeId,
      propertyCode: dto.property_code,
      propertyType: dto.property_type,
      listingType: dto.listing_type,
      locationCity: dto.location_city ?? null,
      locationDistrict: dto.location_district ?? null,
      locationStreet: dto.location_street ?? null,
      price: dto.price ?? null,
      currency: dto.currency ?? null,
      areaSqm: dto.area_sqm ?? null,
      bedrooms: dto.bedrooms ?? null,
      bathrooms: dto.bathrooms ?? null,
      features: dto.features ?? null,
      title: dto.title,
      description: dto.description ?? null,
      images: dto.images ?? null,
      status: dto.status ?? 'available',
      contactPerson: dto.contact_person ?? null,
      contactPhone: dto.contact_phone ?? null,
      googleMapsLink: dto.google_maps_link ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      slug: dto.slug ?? this.generateSlug(dto.title, dto.property_code),
      isFeatured: dto.is_featured ?? false,
    });

    const saved = await this.propertiesRepo.save(entity);
    return saved;
  }

  async update(officeId: string, id: string, dto: UpdatePropertyDto) {
    const property = await this.propertiesRepo.findOne({ where: { id, officeId } });
    if (!property) throw new NotFoundException('العقار غير موجود');

    const merged = this.propertiesRepo.merge(property, {
      propertyCode: dto.property_code ?? property.propertyCode,
      propertyType: dto.property_type ?? property.propertyType,
      listingType: dto.listing_type ?? property.listingType,
      locationCity: dto.location_city ?? property.locationCity,
      locationDistrict: dto.location_district ?? property.locationDistrict,
      locationStreet: dto.location_street ?? property.locationStreet,
      price: dto.price ?? property.price,
      currency: dto.currency ?? property.currency,
      areaSqm: dto.area_sqm ?? property.areaSqm,
      bedrooms: typeof dto.bedrooms === 'number' ? dto.bedrooms : property.bedrooms,
      bathrooms: typeof dto.bathrooms === 'number' ? dto.bathrooms : property.bathrooms,
      features: dto.features ?? property.features,
      title: dto.title ?? property.title,
      description: dto.description ?? property.description,
      images: dto.images ?? property.images,
      status: dto.status ?? property.status,
      contactPerson: dto.contact_person ?? property.contactPerson,
      contactPhone: dto.contact_phone ?? property.contactPhone,
      googleMapsLink: dto.google_maps_link ?? property.googleMapsLink,
      latitude: dto.latitude ?? property.latitude,
      longitude: dto.longitude ?? property.longitude,
      slug: dto.slug ?? property.slug,
      isFeatured: typeof dto.is_featured === 'boolean' ? dto.is_featured : property.isFeatured,
    });

    const saved = await this.propertiesRepo.save(merged);
    return saved;
  }

  async softDelete(officeId: string, id: string) {
    const property = await this.propertiesRepo.findOne({ where: { id, officeId } });
    if (!property) throw new NotFoundException('العقار غير موجود');
    property.status = 'deleted';
    await this.propertiesRepo.save(property);
    return { success: true };
  }

  async getPublicListings(officeCode: string, filters: FilterPropertiesDto) {
    // يفترض أن officeCode == office_id في هذه المرحلة
    return this.findAll(officeCode, { ...filters, status: 'available' });
  }

  async getPublicBySlug(officeCode: string, slug: string) {
    const property = await this.propertiesRepo.findOne({ where: { slug, officeId: officeCode }, relations: ['imagesRel'] });
    if (!property) throw new NotFoundException('العقار غير موجود');
    property.viewCount = (property.viewCount ?? 0) + 1;
    await this.propertiesRepo.save(property);
    return property;
  }

  async addImage(propertyId: string, url: string, userId?: string, fileName?: string, fileSize?: number, isFeatured?: boolean) {
    const property = await this.propertiesRepo.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('العقار غير موجود');

    const image = this.imagesRepo.create({
      propertyId,
      imageUrl: url,
      uploadedBy: userId ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      isFeatured: Boolean(isFeatured),
    });
    await this.imagesRepo.save(image);

    // تحديث العداد والصورة المميزة
    const count = await this.imagesRepo.count({ where: { propertyId } });
    property.imageCount = count;
    if (image.isFeatured) {
      await this.imagesRepo.update({ propertyId, id: Not(image.id) } as any, { isFeatured: false } as any);
      property.featuredImage = image.imageUrl;
    }
    await this.propertiesRepo.save(property);

    return image;
  }

  async setFeaturedImage(propertyId: string, imageId: string) {
    const property = await this.propertiesRepo.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('العقار غير موجود');

    const image = await this.imagesRepo.findOne({ where: { id: imageId, propertyId } });
    if (!image) throw new NotFoundException('الصورة غير موجودة');

    await this.imagesRepo.update({ propertyId } as any, { isFeatured: false } as any);
    image.isFeatured = true;
    await this.imagesRepo.save(image);

    property.featuredImage = image.imageUrl;
    await this.propertiesRepo.save(property);

    return image;
  }

  async removeImage(propertyId: string, imageId: string) {
    const image = await this.imagesRepo.findOne({ where: { id: imageId, propertyId } });
    if (!image) throw new NotFoundException('الصورة غير موجودة');
    await this.imagesRepo.remove(image);
    const count = await this.imagesRepo.count({ where: { propertyId } });
    await this.propertiesRepo.update({ id: propertyId } as any, { imageCount: count } as any);
    return { success: true };
  }

  private generateSlug(title: string, code: string): string {
    const base = (title || code || 'property')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-');
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
