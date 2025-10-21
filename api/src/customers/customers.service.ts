import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private supabase: SupabaseService) {}

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
    let query = this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('office_id', officeId);
    
    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
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
