import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private supabase: SupabaseService) {}

  // Helper: Convert camelCase to snake_case for database
  private toSnakeCase(obj: any): any {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = value;
      }
    }
    return result;
  }

  // Helper: Convert snake_case to camelCase for response
  private toCamelCase(obj: any): any {
    if (!obj) return obj;
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }

  async create(officeId: string, userId: string, dto: CreateCustomerDto) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .insert({
        office_id: officeId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email || null,
        national_id: dto.nationalId || null,
        type: dto.type,
        status: dto.status || 'potential',
        address: dto.address || null,
        city: dto.city || null,
        preferred_contact_method: dto.preferredContactMethod || 'phone',
        notes: dto.notes || null,
        tags: dto.tags || [],
        source: dto.source || null,
        rating: dto.rating || null,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(officeId: string, filters?: any) {
    // Pagination
    const page: number = Math.max(1, Number(filters?.page ?? 1));
    const limit: number = Math.min(100, Math.max(1, Number(filters?.limit ?? 20)));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Base query with total count
    let query = this.supabase
      .getClient()
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('office_id', officeId);

    // Filters (minimal useful subset; extend as needed)
    if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.city) query = query.eq('city', filters.city);
    if (filters?.assigned_staff_id) query = query.eq('assigned_staff_id', filters.assigned_staff_id);
    if (filters?.search) {
      const term = String(filters.search).trim();
      if (term) {
        // Search in name/phone/email
        query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
      }
    }

    // Sorting
    const orderBy = filters?.order_by ?? 'created_at';
    const ascending = (filters?.order ?? 'desc') === 'asc';
    query = query.order(orderBy, { ascending });

    // Pagination range
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], total: count || 0, page, limit };
  }

  async findOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();
    if (error) throw new NotFoundException();
    return data;
  }

  async update(officeId: string, id: string, dto: UpdateCustomerDto) {
    const updates: any = { updated_at: new Date().toISOString() };
    if (dto.name) updates.name = dto.name;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.email) updates.email = dto.email;
    if (dto.nationalId) updates.national_id = dto.nationalId;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.preferredContactMethod) updates.preferred_contact_method = dto.preferredContactMethod;

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
    const { error } = await this.supabase.getClient()
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('office_id', officeId);
    if (error) throw error;
    return { message: 'Customer deleted' };
  }

  async getStats(officeId: string) {
    return { total: 0, active: 0, potential: 0 };
  }

  async search(officeId: string, term: string) {
    const { data } = await this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('office_id', officeId)
      .or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
    return data || [];
  }

  async exportExcel(officeId: string) {
    return [];
  }

  async getNotes(officeId: string, customerId: string) {
    return [];
  }

  async createNote(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }

  async updateNote(officeId: string, customerId: string, noteId: string, dto: any) {
    return {};
  }

  async removeNote(officeId: string, customerId: string, noteId: string) {
    return { message: 'Note deleted' };
  }

  async getInteractions(officeId: string, customerId: string) {
    return [];
  }

  async createInteraction(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }

  async linkProperty(officeId: string, customerId: string, dto: any) {
    return {};
  }

  async unlinkProperty(officeId: string, customerId: string, propertyId: string) {
    return { message: 'Property unlinked' };
  }
}
