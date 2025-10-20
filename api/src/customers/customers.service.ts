import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomersDto } from './dto/filter-customers.dto';
import { CreateCustomerNoteDto } from './dto/create-customer-note.dto';
import { UpdateCustomerNoteDto } from './dto/update-customer-note.dto';
import { CreateCustomerInteractionDto } from './dto/create-customer-interaction.dto';
import { LinkPropertyDto } from './dto/link-property.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(officeId: string, filters: FilterCustomersDto) {
    let query = this.supabase.getClient()
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('office_id', officeId);

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.city) query = query.eq('city', filters.city);
    if (filters.source) query = query.eq('source', filters.source);
    if (filters.rating) query = query.eq('rating', filters.rating);
    if (filters.assigned_staff_id) query = query.eq('assigned_staff_id', filters.assigned_staff_id);

    // Order
    const orderBy = filters.order_by ?? 'created_at';
    const orderDir = (filters.order ?? 'desc') === 'asc';
    query = query.order(orderBy, { ascending: orderDir });

    // Pagination
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  async getStats(officeId: string) {
    const { data: customers, error } = await this.supabase.getClient()
      .from('customers')
      .select('type, status, total_spent, total_earned')
      .eq('office_id', officeId);

    if (error) throw error;

    const stats = {
      total: customers?.length || 0,
      active: customers?.filter(c => c.status === 'active').length || 0,
      inactive: customers?.filter(c => c.status === 'inactive').length || 0,
      blocked: customers?.filter(c => c.status === 'blocked').length || 0,
      buyers: customers?.filter(c => c.type === 'buyer' || c.type === 'both').length || 0,
      sellers: customers?.filter(c => c.type === 'seller' || c.type === 'both').length || 0,
      renters: customers?.filter(c => c.type === 'renter' || c.type === 'both').length || 0,
      landlords: customers?.filter(c => c.type === 'landlord' || c.type === 'both').length || 0,
      total_spent: customers?.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0) || 0,
      total_earned: customers?.reduce((sum, c) => sum + (Number(c.total_earned) || 0), 0) || 0,
    };

    return stats;
  }

  async findOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (error || !data) throw new NotFoundException('العميل غير موجود');
    return data;
  }

  async create(officeId: string, userId: string, dto: CreateCustomerDto) {
    // Check if phone already exists
    const { data: exists } = await this.supabase.getClient()
      .from('customers')
      .select('id')
      .eq('office_id', officeId)
      .eq('phone', dto.phone)
      .single();

    if (exists) throw new BadRequestException('رقم الهاتف مسجل مسبقاً');

    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .insert({
        office_id: officeId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email || null,
        national_id: dto.national_id || null,
        type: dto.type,
        status: dto.status || 'active',
        address: dto.address || null,
        city: dto.city || null,
        preferred_contact_method: dto.preferred_contact_method || null,
        notes: dto.notes || null,
        tags: dto.tags || null,
        source: dto.source || null,
        rating: dto.rating || null,
        assigned_staff_id: dto.assigned_staff_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(officeId: string, id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(officeId, id);

    // Check phone uniqueness if changed
    if (dto.phone && dto.phone !== customer.phone) {
      const { data: exists } = await this.supabase.getClient()
        .from('customers')
        .select('id')
        .eq('office_id', officeId)
        .eq('phone', dto.phone)
        .neq('id', id)
        .single();

      if (exists) throw new BadRequestException('رقم الهاتف مسجل مسبقاً');
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.national_id !== undefined) updates.national_id = dto.national_id;
    if (dto.type !== undefined) updates.type = dto.type;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.address !== undefined) updates.address = dto.address;
    if (dto.city !== undefined) updates.city = dto.city;
    if (dto.preferred_contact_method !== undefined) updates.preferred_contact_method = dto.preferred_contact_method;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.tags !== undefined) updates.tags = dto.tags;
    if (dto.source !== undefined) updates.source = dto.source;
    if (dto.rating !== undefined) updates.rating = dto.rating;
    if (dto.assigned_staff_id !== undefined) updates.assigned_staff_id = dto.assigned_staff_id;

    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('office_id', officeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(officeId: string, id: string) {
    await this.findOne(officeId, id);

    const { error } = await this.supabase.getClient()
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('office_id', officeId);

    if (error) throw error;
    return { success: true };
  }

  async search(officeId: string, searchTerm: string) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .select('id, name, phone, email, type, status')
      .eq('office_id', officeId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async exportExcel(officeId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('office_id', officeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Customer Notes
  async getNotes(officeId: string, customerId: string) {
    await this.findOne(officeId, customerId);

    const { data, error } = await this.supabase.getClient()
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createNote(officeId: string, customerId: string, userId: string, dto: CreateCustomerNoteDto) {
    await this.findOne(officeId, customerId);

    const { data, error } = await this.supabase.getClient()
      .from('customer_notes')
      .insert({
        customer_id: customerId,
        content: dto.content,
        is_important: dto.is_important || false,
        tags: dto.tags || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNote(officeId: string, customerId: string, noteId: string, dto: UpdateCustomerNoteDto) {
    await this.findOne(officeId, customerId);

    const updates: any = {};
    if (dto.content !== undefined) updates.content = dto.content;
    if (dto.is_important !== undefined) updates.is_important = dto.is_important;
    if (dto.tags !== undefined) updates.tags = dto.tags;

    const { data, error } = await this.supabase.getClient()
      .from('customer_notes')
      .update(updates)
      .eq('id', noteId)
      .eq('customer_id', customerId)
      .select()
      .single();

    if (error) throw new NotFoundException('الملاحظة غير موجودة');
    return data;
  }

  async removeNote(officeId: string, customerId: string, noteId: string) {
    await this.findOne(officeId, customerId);

    const { error } = await this.supabase.getClient()
      .from('customer_notes')
      .delete()
      .eq('id', noteId)
      .eq('customer_id', customerId);

    if (error) throw new NotFoundException('الملاحظة غير موجودة');
    return { success: true };
  }

  // Customer Interactions
  async getInteractions(officeId: string, customerId: string) {
    await this.findOne(officeId, customerId);

    const { data, error } = await this.supabase.getClient()
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createInteraction(officeId: string, customerId: string, userId: string, dto: CreateCustomerInteractionDto) {
    await this.findOne(officeId, customerId);

    const { data, error } = await this.supabase.getClient()
      .from('customer_interactions')
      .insert({
        customer_id: customerId,
        type: dto.type,
        description: dto.description,
        date: dto.date,
        property_id: dto.property_id || null,
        contract_id: dto.contract_id || null,
        outcome: dto.outcome || null,
        next_follow_up: dto.next_follow_up || null,
        staff_id: dto.staff_id || userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update last_contact_date
    await this.supabase.getClient()
      .from('customers')
      .update({ last_contact_date: dto.date })
      .eq('id', customerId);

    return data;
  }

  // Property Relationships
  async linkProperty(officeId: string, customerId: string, dto: LinkPropertyDto) {
    await this.findOne(officeId, customerId);

    // Check if property exists
    const { data: property } = await this.supabase.getClient()
      .from('properties')
      .select('id')
      .eq('id', dto.property_id)
      .eq('office_id', officeId)
      .single();

    if (!property) throw new NotFoundException('العقار غير موجود');

    // Check if relationship already exists
    const { data: existing } = await this.supabase.getClient()
      .from('customer_properties')
      .select('id')
      .eq('customer_id', customerId)
      .eq('property_id', dto.property_id)
      .single();

    if (existing) throw new BadRequestException('العلاقة موجودة مسبقاً');

    const insertData: any = {
      customer_id: customerId,
      property_id: dto.property_id,
      relationship: dto.relationship,
      start_date: dto.start_date || null,
      end_date: dto.end_date || null,
    };

    // Set special timestamps based on relationship
    if (dto.relationship === 'viewed') {
      insertData.viewed_at = new Date().toISOString();
    } else if (dto.relationship === 'interested') {
      insertData.interested_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase.getClient()
      .from('customer_properties')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unlinkProperty(officeId: string, customerId: string, propertyId: string) {
    await this.findOne(officeId, customerId);

    const { error } = await this.supabase.getClient()
      .from('customer_properties')
      .delete()
      .eq('customer_id', customerId)
      .eq('property_id', propertyId);

    if (error) throw new NotFoundException('العلاقة غير موجودة');
    return { success: true };
  }
}
