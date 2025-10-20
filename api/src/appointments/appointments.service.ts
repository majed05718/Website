import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FilterAppointmentsDto } from './dto/filter-appointments.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(officeId: string, filters: FilterAppointmentsDto) {
    let query = this.supabase.getClient()
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('office_id', officeId);

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.date) query = query.eq('date', filters.date);
    if (filters.start_date) query = query.gte('date', filters.start_date);
    if (filters.end_date) query = query.lte('date', filters.end_date);
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
    if (filters.assigned_staff_id) query = query.eq('assigned_staff_id', filters.assigned_staff_id);

    // Order
    const orderBy = filters.order_by ?? 'date';
    const orderDir = (filters.order ?? 'asc') === 'asc';
    query = query.order(orderBy, { ascending: orderDir });
    
    // Secondary sort by start_time
    if (orderBy !== 'start_time') {
      query = query.order('start_time', { ascending: true });
    }

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
    const today = new Date().toISOString().split('T')[0];
    
    const { data: appointments, error } = await this.supabase.getClient()
      .from('appointments')
      .select('status, type, date')
      .eq('office_id', officeId);

    if (error) throw error;

    const stats = {
      total: appointments?.length || 0,
      scheduled: appointments?.filter(a => a.status === 'scheduled').length || 0,
      confirmed: appointments?.filter(a => a.status === 'confirmed').length || 0,
      in_progress: appointments?.filter(a => a.status === 'in_progress').length || 0,
      completed: appointments?.filter(a => a.status === 'completed').length || 0,
      cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
      no_show: appointments?.filter(a => a.status === 'no_show').length || 0,
      today: appointments?.filter(a => a.date === today).length || 0,
      upcoming: appointments?.filter(a => a.date > today && ['scheduled', 'confirmed'].includes(a.status)).length || 0,
      viewing: appointments?.filter(a => a.type === 'viewing').length || 0,
      meeting: appointments?.filter(a => a.type === 'meeting').length || 0,
      signing: appointments?.filter(a => a.type === 'signing').length || 0,
    };

    return stats;
  }

  async getCalendar(officeId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('office_id', officeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getToday(officeId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('office_id', officeId)
      .eq('date', today)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUpcoming(officeId: string, limit = 10) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('office_id', officeId)
      .gte('date', today)
      .in('status', ['scheduled', 'confirmed'])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async findOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (error || !data) throw new NotFoundException('الموعد غير موجود');
    return data;
  }

  async create(officeId: string, userId: string, dto: CreateAppointmentDto) {
    // Check for conflicts
    const conflicts = await this.checkConflicts(officeId, dto.assigned_staff_id, dto.date, dto.start_time, dto.end_time);
    if (conflicts.length > 0) {
      throw new BadRequestException('يوجد تعارض مع موعد آخر');
    }

    // Calculate duration if not provided
    const duration = dto.duration || this.calculateDuration(dto.start_time, dto.end_time);

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .insert({
        office_id: officeId,
        title: dto.title,
        description: dto.description || null,
        type: dto.type,
        status: 'scheduled',
        date: dto.date,
        start_time: dto.start_time,
        end_time: dto.end_time,
        duration,
        property_id: dto.property_id || null,
        customer_id: dto.customer_id || null,
        assigned_staff_id: dto.assigned_staff_id,
        location: dto.location || null,
        meeting_link: dto.meeting_link || null,
        notes: dto.notes || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(officeId: string, id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(officeId, id);

    // Check for conflicts if time/date/staff changed
    if (dto.date || dto.start_time || dto.end_time || dto.assigned_staff_id) {
      const date = dto.date || appointment.date;
      const startTime = dto.start_time || appointment.start_time;
      const endTime = dto.end_time || appointment.end_time;
      const staffId = dto.assigned_staff_id || appointment.assigned_staff_id;

      const conflicts = await this.checkConflicts(officeId, staffId, date, startTime, endTime, id);
      if (conflicts.length > 0) {
        throw new BadRequestException('يوجد تعارض مع موعد آخر');
      }
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.type !== undefined) updates.type = dto.type;
    if (dto.date !== undefined) updates.date = dto.date;
    if (dto.start_time !== undefined) updates.start_time = dto.start_time;
    if (dto.end_time !== undefined) updates.end_time = dto.end_time;
    if (dto.duration !== undefined) updates.duration = dto.duration;
    if (dto.property_id !== undefined) updates.property_id = dto.property_id;
    if (dto.customer_id !== undefined) updates.customer_id = dto.customer_id;
    if (dto.assigned_staff_id !== undefined) updates.assigned_staff_id = dto.assigned_staff_id;
    if (dto.location !== undefined) updates.location = dto.location;
    if (dto.meeting_link !== undefined) updates.meeting_link = dto.meeting_link;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    // Recalculate duration if times changed
    if (dto.start_time || dto.end_time) {
      const startTime = dto.start_time || appointment.start_time;
      const endTime = dto.end_time || appointment.end_time;
      updates.duration = this.calculateDuration(startTime, endTime);
    }

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
    await this.findOne(officeId, id);

    const { error } = await this.supabase.getClient()
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('office_id', officeId);

    if (error) throw error;
    return { success: true };
  }

  async updateStatus(officeId: string, id: string, userId: string, dto: UpdateStatusDto) {
    await this.findOne(officeId, id);

    const updates: any = {
      status: dto.status,
      updated_at: new Date().toISOString(),
    };

    if (dto.notes) {
      updates.notes = dto.notes;
    }

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

  async cancel(officeId: string, id: string, userId: string, dto: CancelAppointmentDto) {
    await this.findOne(officeId, id);

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: dto.cancellation_reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('office_id', officeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async complete(officeId: string, id: string, dto: CompleteAppointmentDto) {
    await this.findOne(officeId, id);

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .update({
        status: 'completed',
        completion_notes: dto.completion_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('office_id', officeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async sendReminder(officeId: string, id: string) {
    const appointment = await this.findOne(officeId, id);
    
    // Here you would implement the actual reminder logic
    // For now, we'll just return success
    // TODO: Integrate with WhatsApp/Email service
    
    return {
      success: true,
      message: 'تم إرسال التذكير بنجاح',
      appointment,
    };
  }

  async checkAvailability(officeId: string, dto: CheckAvailabilityDto) {
    const conflicts = await this.checkConflicts(
      officeId,
      dto.assigned_staff_id,
      dto.date,
      dto.start_time,
      dto.end_time
    );

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  private async checkConflicts(
    officeId: string,
    staffId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) {
    let query = this.supabase.getClient()
      .from('appointments')
      .select('id, title, start_time, end_time')
      .eq('office_id', officeId)
      .eq('assigned_staff_id', staffId)
      .eq('date', date)
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Check for time conflicts
    const conflicts = (data || []).filter(apt => {
      return this.timesOverlap(startTime, endTime, apt.start_time, apt.end_time);
    });

    return conflicts;
  }

  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2;
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  }
}
