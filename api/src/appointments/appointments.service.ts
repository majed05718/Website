import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
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

  async create(officeId: string, userId: string, dto: CreateAppointmentDto) {
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .insert({
        office_id: officeId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: 'scheduled',
        date: dto.date,
        start_time: dto.startTime,
        end_time: dto.endTime,
        property_id: dto.propertyId,
        customer_id: dto.customerId,
        assigned_staff_id: dto.assignedStaffId,
        location: dto.location,
        meeting_link: dto.meetingLink,
        notes: dto.notes,
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
    const limit: number = Math.min(100, Math.max(1, Number(filters?.limit ?? 50)));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Base query with total count
    let query = this.supabase
      .getClient()
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('office_id', officeId);
    
    // Filters
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.date) query = query.eq('date', filters.date);
    if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters?.assigned_staff_id) query = query.eq('assigned_staff_id', filters.assigned_staff_id);
    if (filters?.property_id) query = query.eq('property_id', filters.property_id);
    if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id);

    // Ordering: upcoming first by date
    const orderBy = filters?.order_by ?? 'date';
    const ascending = (filters?.order ?? 'asc') === 'asc';
    query = query.order(orderBy, { ascending });

    // Range for pagination
    query = query.range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit };
  }

  async findOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();
    if (error) throw new NotFoundException();
    return data;
  }

  async update(officeId: string, id: string, dto: UpdateAppointmentDto) {
    const updates: any = { updated_at: new Date().toISOString() };
    if (dto.title) updates.title = dto.title;
    if (dto.startTime) updates.start_time = dto.startTime;
    if (dto.endTime) updates.end_time = dto.endTime;

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
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
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('office_id', officeId);
    if (error) throw error;
    return { message: 'Appointment deleted' };
  }

  async getStats(officeId: string) {
    return { total: 0, today: 0, upcoming: 0 };
  }

  async getCalendar(officeId: string, startDate: string, endDate: string) {
    return [];
  }

  async getToday(officeId: string) {
    return [];
  }

  async getUpcoming(officeId: string, limit?: number) {
    return [];
  }

  async updateStatus(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }

  async cancel(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }

  async complete(officeId: string, id: string, dto: any) {
    return {};
  }

  async sendReminder(officeId: string, id: string) {
    return { message: 'Reminder sent' };
  }

  async checkAvailability(officeId: string, dto: any) {
    return { available: true };
  }
}
