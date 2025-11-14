import api from '../api';

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalContracts: number;
  activeContracts: number;
  totalCustomers: number;
  newCustomers: number;
}

export interface PropertiesBreakdown {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCity: Record<string, number>;
}

export interface FinancialsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueByMonth: Array<{ month: string; amount: number }>;
  expensesByCategory: Record<string, number>;
}

export interface KPIsData {
  occupancyRate: number;
  averageContractValue: number;
  customerSatisfaction: number;
  collectionRate: number;
}

export interface StaffPerformance {
  staffPhone: string;
  staffName: string;
  propertiesSold: number;
  totalRevenue: number;
  customerRating: number;
}

export const analyticsApi = {
  /**
   * Get dashboard summary statistics
   */
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get('/api/analytics/dashboard');
    return response.data;
  },

  /**
   * Get properties breakdown by type, status, and city
   */
  async getPropertiesBreakdown(): Promise<PropertiesBreakdown> {
    const response = await api.get('/api/analytics/properties');
    return response.data;
  },

  /**
   * Get financial analytics
   */
  async getFinancials(reportPeriod?: string): Promise<FinancialsData> {
    const response = await api.get('/api/analytics/financials', {
      params: { report_period: reportPeriod },
    });
    return response.data;
  },

  /**
   * Get key performance indicators
   */
  async getKPIs(): Promise<KPIsData> {
    const response = await api.get('/api/analytics/kpis');
    return response.data;
  },

  /**
   * Get staff performance metrics
   */
  async getStaffPerformance(
    staffPhone?: string,
    reportPeriod?: string
  ): Promise<StaffPerformance[]> {
    const response = await api.get('/api/analytics/staff-performance', {
      params: {
        staff_phone: staffPhone,
        report_period: reportPeriod,
      },
    });
    return response.data;
  },
};
