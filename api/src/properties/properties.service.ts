import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(officeId: string, filters: FilterPropertiesDto) {
    let query = this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)', { count: 'exact' })
      .eq('office_id', officeId);

    if (filters.type) query = query.eq('property_type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.city) query = query.eq('location_city', filters.city);
    if (filters.district) query = query.eq('location_district', filters.district);
    if (typeof filters.is_featured === 'boolean') query = query.eq('is_featured', filters.is_featured);

    if (filters.min_price) query = query.gte('price', Number(filters.min_price));
    if (filters.max_price) query = query.lte('price', Number(filters.max_price));
    if (filters.min_area) query = query.gte('area_sqm', Number(filters.min_area));
    if (filters.max_area) query = query.lte('area_sqm', Number(filters.max_area));
    if (typeof filters.bedrooms === 'number') query = query.eq('bedrooms', filters.bedrooms);
    if (typeof filters.bathrooms === 'number') query = query.eq('bathrooms', filters.bathrooms);

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const orderBy = filters.order_by ?? 'created_at';
    const orderDir = (filters.order ?? 'desc') === 'asc';
    query = query.order(orderBy, { ascending: orderDir });

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0, page, limit };
  }

  async findOneWithImages(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (error || !data) throw new NotFoundException('العقار غير موجود');
    return data;
  }

  async create(officeId: string, userId: string, dto: CreatePropertyDto) {
    const { data: exists } = await this.supabase.getClient()
      .from('properties')
      .select('id')
      .eq('property_code', dto.property_code)
      .single();

    if (exists) throw new BadRequestException('رمز العقار مستخدم مسبقاً');

    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .insert({
        office_id: officeId,
        property_code: dto.property_code,
        property_type: dto.property_type,
        listing_type: dto.listing_type,
        location_city: dto.location_city ?? null,
        location_district: dto.location_district ?? null,
        location_street: dto.location_street ?? null,
        price: dto.price ?? null,
        currency: dto.currency ?? null,
        area_sqm: dto.area_sqm ?? null,
        bedrooms: dto.bedrooms ?? null,
        bathrooms: dto.bathrooms ?? null,
        features: dto.features ?? null,
        title: dto.title,
        description: dto.description ?? null,
        images: dto.images ?? null,
        status: dto.status ?? 'available',
        contact_person: dto.contact_person ?? null,
        contact_phone: dto.contact_phone ?? null,
        google_maps_link: dto.google_maps_link ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        slug: dto.slug ?? this.generateSlug(dto.title, dto.property_code),
        is_featured: dto.is_featured ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(officeId: string, id: string, dto: UpdatePropertyDto) {
    const { data: property } = await this.supabase.getClient()
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (!property) throw new NotFoundException('العقار غير موجود');

    const updates: any = {};
    if (dto.property_code) updates.property_code = dto.property_code;
    if (dto.property_type) updates.property_type = dto.property_type;
    if (dto.listing_type) updates.listing_type = dto.listing_type;
    if (dto.location_city) updates.location_city = dto.location_city;
    if (dto.location_district) updates.location_district = dto.location_district;
    if (dto.location_street) updates.location_street = dto.location_street;
    if (dto.price) updates.price = dto.price;
    if (dto.currency) updates.currency = dto.currency;
    if (dto.area_sqm) updates.area_sqm = dto.area_sqm;
    if (typeof dto.bedrooms === 'number') updates.bedrooms = dto.bedrooms;
    if (typeof dto.bathrooms === 'number') updates.bathrooms = dto.bathrooms;
    if (dto.features) updates.features = dto.features;
    if (dto.title) updates.title = dto.title;
    if (dto.description) updates.description = dto.description;
    if (dto.images) updates.images = dto.images;
    if (dto.status) updates.status = dto.status;
    if (dto.contact_person) updates.contact_person = dto.contact_person;
    if (dto.contact_phone) updates.contact_phone = dto.contact_phone;
    if (dto.google_maps_link) updates.google_maps_link = dto.google_maps_link;
    if (dto.latitude) updates.latitude = dto.latitude;
    if (dto.longitude) updates.longitude = dto.longitude;
    if (dto.slug) updates.slug = dto.slug;
    if (typeof dto.is_featured === 'boolean') updates.is_featured = dto.is_featured;

    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .update(updates)
      .eq('id', id)
      .eq('office_id', officeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(officeId: string, id: string) {
    const { error } = await this.supabase.getClient()
      .from('properties')
      .update({ status: 'deleted' })
      .eq('id', id)
      .eq('office_id', officeId);

    if (error) throw error;
    return { success: true };
  }

  async getPublicListings(officeCode: string, filters: FilterPropertiesDto) {
    return this.findAll(officeCode, { ...filters, status: 'available' });
  }

  async getPublicBySlug(officeCode: string, slug: string) {
    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('slug', slug)
      .eq('office_id', officeCode)
      .single();

    if (error || !data) throw new NotFoundException('العقار غير موجود');

    await this.supabase.getClient()
      .from('properties')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('id', data.id);

    return data;
  }

  async addImage(propertyId: string, url: string, userId?: string, fileName?: string, fileSize?: number, isFeatured?: boolean) {
    const { data: property } = await this.supabase.getClient()
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();

    if (!property) throw new NotFoundException('العقار غير موجود');

    const { data: image, error } = await this.supabase.getClient()
      .from('property_images')
      .insert({
        property_id: propertyId,
        image_url: url,
        uploaded_by: userId ?? null,
        file_name: fileName ?? null,
        file_size: fileSize ?? null,
        is_featured: Boolean(isFeatured),
      })
      .select()
      .single();

    if (error) throw error;

    const { count } = await this.supabase.getClient()
      .from('property_images')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId);

    if (isFeatured) {
      await this.supabase.getClient()
        .from('property_images')
        .update({ is_featured: false })
        .eq('property_id', propertyId)
        .neq('id', image.id);

      await this.supabase.getClient()
        .from('properties')
        .update({ 
          image_count: count || 0,
          featured_image: url
        })
        .eq('id', propertyId);
    } else {
      await this.supabase.getClient()
        .from('properties')
        .update({ image_count: count || 0 })
        .eq('id', propertyId);
    }

    return image;
  }

  async setFeaturedImage(propertyId: string, imageId: string) {
    const { data: image } = await this.supabase.getClient()
      .from('property_images')
      .select('*')
      .eq('id', imageId)
      .eq('property_id', propertyId)
      .single();

    if (!image) throw new NotFoundException('الصورة غير موجودة');

    await this.supabase.getClient()
      .from('property_images')
      .update({ is_featured: false })
      .eq('property_id', propertyId);

    await this.supabase.getClient()
      .from('property_images')
      .update({ is_featured: true })
      .eq('id', imageId);

    await this.supabase.getClient()
      .from('properties')
      .update({ featured_image: image.image_url })
      .eq('id', propertyId);

    return image;
  }

  async removeImage(propertyId: string, imageId: string) {
    const { error } = await this.supabase.getClient()
      .from('property_images')
      .delete()
      .eq('id', imageId)
      .eq('property_id', propertyId);

    if (error) throw error;

    const { count } = await this.supabase.getClient()
      .from('property_images')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId);

    await this.supabase.getClient()
      .from('properties')
      .update({ image_count: count || 0 })
      .eq('id', propertyId);

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
