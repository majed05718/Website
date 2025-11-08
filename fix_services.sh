#!/bin/bash
echo "🔧 إصلاح Services..."

# Customers Service
cat > ~/workspace/api/src/customers/customers.service.ts << 'EOF1'
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private supabase: SupabaseService) {}

  async create(officeId: string, dto: CreateCustomerDto) {
    const { data, error } = await this.supabase.client
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
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(officeId: string) {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .eq('office_id', officeId);
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException();
    return data;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const updates: any = {};
    if (dto.name) updates.name = dto.name;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.email) updates.email = dto.email;
    if (dto.nationalId) updates.national_id = dto.nationalId;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.preferredContactMethod) updates.preferred_contact_method = dto.preferredContactMethod;

    const { data, error } = await this.supabase.client
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Deleted' };
  }
}
EOF1

# Appointments Service
cat > ~/workspace/api/src/appointments/appointments.service.ts << 'EOF2'
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private supabase: SupabaseService) {}

  async create(officeId: string, dto: CreateAppointmentDto) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .insert({
        office_id: officeId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        date: dto.date,
        start_time: dto.startTime,
        end_time: dto.endTime,
        property_id: dto.propertyId,
        customer_id: dto.customerId,
        assigned_staff_id: dto.assignedStaffId,
        location: dto.location,
        meeting_link: dto.meetingLink,
        notes: dto.notes,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(officeId: string) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .select('*')
      .eq('office_id', officeId);
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException();
    return data;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const updates: any = {};
    if (dto.title) updates.title = dto.title;
    if (dto.startTime) updates.start_time = dto.startTime;
    if (dto.endTime) updates.end_time = dto.endTime;
    if (dto.propertyId) updates.property_id = dto.propertyId;
    if (dto.customerId) updates.customer_id = dto.customerId;

    const { data, error } = await this.supabase.client
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client
      .from('appointments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Deleted' };
  }
}
EOF2

cd ~/workspace/api
npm run build
