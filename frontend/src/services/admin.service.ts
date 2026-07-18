import apiClient from '../config/api.config';
import type { ApiResponse } from '../types/auth.types';
import type {
  ContentGrowthPoint,
  DashboardSeries,
  DashboardSummary,
  UserGrowthPoint,
} from '../types/admin.types';

export type DashboardGranularity = 'DAY' | 'MONTH';

export interface DashboardRange {
  from: string;
  to: string;
  granularity: DashboardGranularity;
}

export const adminService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>('/admin/dashboard/summary');
    return response.data.data;
  },

  getUserGrowth: async (range: DashboardRange): Promise<DashboardSeries<UserGrowthPoint>> => {
    const response = await apiClient.get<ApiResponse<DashboardSeries<UserGrowthPoint>>>(
      '/admin/dashboard/user-growth',
      { params: range },
    );
    return response.data.data;
  },

  getContentGrowth: async (
    range: DashboardRange,
  ): Promise<DashboardSeries<ContentGrowthPoint>> => {
    const response = await apiClient.get<ApiResponse<DashboardSeries<ContentGrowthPoint>>>(
      '/admin/dashboard/content-growth',
      { params: range },
    );
    return response.data.data;
  },
};
