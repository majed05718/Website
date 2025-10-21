import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private supabase: SupabaseService) {}

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
    let query = this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('office_id', officeId);
    
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.date) query = query.eq('date', filters.date);

    const { data, error } = await query.order('date', { ascending: true });
    if (error) throw error;
    return data;
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
