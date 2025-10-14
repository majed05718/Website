import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface CacheEntry { data: any; expiresAt: number }

@Injectable()
export class AnalyticsService {
  private cache = new Map<string, CacheEntry>();

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private getCache<T>(key: string): T | null {
    const it = this.cache.get(key);
    if (!it) return null;
    if (it.expiresAt < Date.now()) { this.cache.delete(key); return null; }
    return it.data as T;
  }
  private setCache(key: string, data: any, ms: number) { this.cache.set(key, { data, expiresAt: Date.now() + ms }); }

  async dashboard(officeId: string) {
    const key = `dash:${officeId}`;
    const cached = this.getCache<any>(key);
    if (cached) return cached;

    const supabase = this.supabaseService.getClient();

    const [propsByStatusRes, activeContractsRes, monthlyRevenueRes, pendingPaymentsRes, mntByStatusRes, recentActivityRes] = await Promise.all([
      supabase.rpc('get_properties_by_status', { p_office_id: officeId }),
      supabase.rpc('get_active_contracts_count', { p_office_id: officeId }),
      supabase.rpc('get_monthly_revenue', { p_office_id: officeId }),
      supabase.from('rental_payments').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'pending'),
      supabase.rpc('get_maintenance_by_status', { p_office_id: officeId }),
      supabase.from('maintenance_requests').select('*').eq('office_id', officeId).order('created_at', { ascending: false }).limit(10),
    ]);

    const data = {
      propertiesByStatus: propsByStatusRes.data || [],
      activeContracts: Number(activeContractsRes.data ?? 0),
      monthlyRevenue: Number(monthlyRevenueRes.data ?? 0),
      pendingPayments: Number(pendingPaymentsRes.count ?? 0),
      maintenanceByStatus: mntByStatusRes.data || [],
      recentMaintenance: recentActivityRes.data || [],
    };

    this.setCache(key, data, 5 * 60 * 1000);
    return data;
  }

  async propertiesBreakdown(officeId: string) {
    const supabase = this.supabaseService.getClient();

    const [byTypeRes, byStatusRes, byCityRes, priceAggRes, countsRes] = await Promise.all([
      supabase.rpc('get_properties_by_type', { p_office_id: officeId }),
      supabase.rpc('get_properties_by_status', { p_office_id: officeId }),
      supabase.rpc('get_properties_by_city', { p_office_id: officeId }),
      supabase.rpc('get_properties_price_aggregate', { p_office_id: officeId }),
      supabase.rpc('get_properties_occupancy_counts', { p_office_id: officeId }),
    ]);

    const byType = byTypeRes.data || [];
    const byStatus = byStatusRes.data || [];
    const byCity = byCityRes.data || [];
    const priceAgg = priceAggRes.data?.[0] || { avgprice: 0, totalprice: 0 };
    const counts = countsRes.data?.[0] || { available: 0, total: 0 };
    const occupancy = counts.total ? (1 - Number(counts.available) / Number(counts.total)) : 0;

    return { byType, byStatus, byCity, avgPrice: Number(priceAgg.avgprice ?? 0), totalPrice: Number(priceAgg.totalprice ?? 0), occupancyRate: occupancy };
  }

  async financials(officeId: string, reportPeriod?: string) {
    const supabase = this.supabaseService.getClient();
    let query = supabase.from('financial_analytics').select('*').eq('office_id', officeId);
    
    if (reportPeriod) {
      query = query.eq('report_period', reportPeriod);
    }
    
    const { data: rows } = await query.order('report_period', { ascending: true });
    
    const trends = {
      revenue: (rows || []).map(r => Number(r.revenue)),
      expenses: (rows || []).map(r => Number(r.expenses)),
      profit: (rows || []).map(r => Number(r.profit)),
      periods: (rows || []).map(r => r.report_period),
    };
    return { rows: rows || [], trends };
  }

  async kpis(officeId: string) {
    const { data: rows } = await this.supabaseService.getClient()
      .from('kpi_tracking')
      .select('*')
      .eq('office_id', officeId);
    
    const data = (rows || []).map(r => ({ name: r.kpi_name, current: Number(r.current_value), target: Number(r.target_value), period: r.report_period }));
    return { items: data };
  }

  async staffPerformance(officeId: string, staffPhone?: string, reportPeriod?: string) {
    let query = this.supabaseService.getClient()
      .from('staff_performance')
      .select('*')
      .eq('office_id', officeId);
    
    if (staffPhone) query = query.eq('staff_phone', staffPhone);
    if (reportPeriod) query = query.eq('report_period', reportPeriod);
    
    const { data: rows } = await query.order('revenue_generated', { ascending: false });
    return { items: rows || [] };
  }
}
