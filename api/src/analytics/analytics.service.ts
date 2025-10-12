import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Property } from '../properties/properties.entity';
import { RentalPayment } from '../payments/rental-payment.entity';
import { MaintenanceRequest } from '../maintenance/maintenance-request.entity';
import { FinancialAnalytics } from './entities/financial-analytics.entity';
import { KpiTracking } from './entities/kpi-tracking.entity';
import { StaffPerformance } from './entities/staff-performance.entity';

interface CacheEntry { data: any; expiresAt: number }

@Injectable()
export class AnalyticsService {
  private cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(Property) private readonly propRepo: Repository<Property>,
    @InjectRepository(RentalPayment) private readonly payRepo: Repository<RentalPayment>,
    @InjectRepository(MaintenanceRequest) private readonly mntRepo: Repository<MaintenanceRequest>,
    @InjectRepository(FinancialAnalytics) private readonly finRepo: Repository<FinancialAnalytics>,
    @InjectRepository(KpiTracking) private readonly kpiRepo: Repository<KpiTracking>,
    @InjectRepository(StaffPerformance) private readonly staffRepo: Repository<StaffPerformance>,
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

    const [propsByStatus, activeContracts, monthlyRevenue, pendingPayments, mntByStatus, recentActivity] = await Promise.all([
      this.propRepo.createQueryBuilder('p')
        .select('p.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('p.officeId = :officeId', { officeId })
        .groupBy('p.status')
        .getRawMany(),
      // العقود النشطة - نفترض أن جدول العقود rental_contracts موجود ويحتوي status='active'
      this.payRepo.query(`SELECT COUNT(DISTINCT contract_id) AS active FROM rental_payments WHERE office_id = $1 AND status != 'cancelled'`, [officeId]),
      this.finRepo.createQueryBuilder('f')
        .select('SUM(CAST(f.revenue as numeric))', 'revenue')
        .where('f.officeId = :officeId', { officeId })
        .andWhere("f.reportPeriod >= to_char(now() - interval '30 days', 'YYYY-MM')")
        .getRawOne(),
      this.payRepo.createQueryBuilder('rp')
        .select('COUNT(*)', 'count')
        .where('rp.officeId = :officeId AND rp.status = :status', { officeId, status: 'pending' })
        .getRawOne(),
      this.mntRepo.createQueryBuilder('m')
        .select('m.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('m.officeId = :officeId', { officeId })
        .groupBy('m.status')
        .getRawMany(),
      this.mntRepo.find({ where: { officeId }, order: { createdAt: 'DESC' }, take: 10 }),
    ]);

    const data = {
      propertiesByStatus: propsByStatus,
      activeContracts: Number(activeContracts?.[0]?.active ?? 0),
      monthlyRevenue: Number(monthlyRevenue?.revenue ?? 0),
      pendingPayments: Number(pendingPayments?.count ?? 0),
      maintenanceByStatus: mntByStatus,
      recentMaintenance: recentActivity,
    };

    this.setCache(key, data, 5 * 60 * 1000);
    return data;
  }

  async propertiesBreakdown(officeId: string) {
    const byType = await this.propRepo.createQueryBuilder('p')
      .select('p.propertyType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('p.officeId = :officeId', { officeId })
      .groupBy('p.propertyType')
      .getRawMany();

    const byStatus = await this.propRepo.createQueryBuilder('p')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('p.officeId = :officeId', { officeId })
      .groupBy('p.status')
      .getRawMany();

    const byCity = await this.propRepo.createQueryBuilder('p')
      .select('p.locationCity', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('p.officeId = :officeId', { officeId })
      .groupBy('p.locationCity')
      .getRawMany();

    const priceAgg = await this.propRepo.createQueryBuilder('p')
      .select('AVG(CAST(p.price as numeric))', 'avgPrice')
      .addSelect('SUM(CAST(p.price as numeric))', 'totalPrice')
      .where('p.officeId = :officeId', { officeId })
      .getRawOne();

    // نسبة الإشغال: نفترض status='available' مقابل غيره
    const counts = await this.propRepo.createQueryBuilder('p')
      .select(`SUM(CASE WHEN p.status = 'available' THEN 1 ELSE 0 END)`, 'available')
      .addSelect('COUNT(*)', 'total')
      .where('p.officeId = :officeId', { officeId })
      .getRawOne();
    const occupancy = counts?.total ? (1 - Number(counts.available) / Number(counts.total)) : 0;

    return { byType, byStatus, byCity, avgPrice: Number(priceAgg?.avgPrice ?? 0), totalPrice: Number(priceAgg?.totalPrice ?? 0), occupancyRate: occupancy };
  }

  async financials(officeId: string, reportPeriod?: string) {
    const qb = this.finRepo.createQueryBuilder('f').where('f.officeId = :officeId', { officeId });
    if (reportPeriod) qb.andWhere('f.reportPeriod = :rp', { rp: reportPeriod });
    const rows = await qb.orderBy('f.reportPeriod', 'ASC').getMany();
    const trends = {
      revenue: rows.map(r => Number(r.revenue)),
      expenses: rows.map(r => Number(r.expenses)),
      profit: rows.map(r => Number(r.profit)),
      periods: rows.map(r => r.reportPeriod),
    };
    return { rows, trends };
  }

  async kpis(officeId: string) {
    const rows = await this.kpiRepo.find({ where: { officeId } });
    const data = rows.map(r => ({ name: r.kpiName, current: Number(r.currentValue), target: Number(r.targetValue), period: r.reportPeriod }));
    return { items: data };
  }

  async staffPerformance(officeId: string, staffPhone?: string, reportPeriod?: string) {
    const qb = this.staffRepo.createQueryBuilder('s').where('s.officeId = :officeId', { officeId });
    if (staffPhone) qb.andWhere('s.staffPhone = :sp', { sp: staffPhone });
    if (reportPeriod) qb.andWhere('s.reportPeriod = :rp', { rp: reportPeriod });
    const rows = await qb.orderBy('s.revenueGenerated', 'DESC').getMany();
    return { items: rows };
  }
}
