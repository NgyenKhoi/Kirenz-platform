import apiClient from '../config/api.config';
import type { ApiResponse } from '../types/auth.types';
import type {
  ContentGrowthPoint,
  DashboardSeries,
  DashboardSummary,
  UserGrowthPoint,
  AdminUser, AdminAction, AdminReport, AdminReportDetail, PageResponse, MonitoringData,
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
  getUsers: async (params: Record<string, unknown>): Promise<PageResponse<AdminUser>> => (await apiClient.get<ApiResponse<PageResponse<AdminUser>>>('/admin/users', { params })).data.data,
  banUser: async (id: string, body: { reason: string; note?: string; evidenceUrl?: string }) => (await apiClient.post<ApiResponse<AdminUser>>(`/admin/users/${id}/ban`, body)).data.data,
  unbanUser: async (id: string, body: { reason: string; note?: string }) => (await apiClient.post<ApiResponse<AdminUser>>(`/admin/users/${id}/unban`, body)).data.data,
  suspendUser: async (id: string, body: { suspendedUntil: string; moderationReason: string; note?: string; evidenceUrl?: string }) => (await apiClient.post<ApiResponse<AdminUser>>(`/admin/users/${id}/suspend`, body)).data.data,
  warnUser: async (id: string, body: { reason: string; message: string; note?: string; evidenceUrl?: string }) => (await apiClient.post<ApiResponse<AdminAction>>(`/admin/users/${id}/warnings`, body)).data.data,
  getUserActions: async (id: string): Promise<PageResponse<AdminAction>> => (await apiClient.get<ApiResponse<PageResponse<AdminAction>>>(`/admin/users/${id}/actions`)).data.data,
  getReports: async (params: Record<string, unknown>): Promise<PageResponse<AdminReport>> => (await apiClient.get<ApiResponse<PageResponse<AdminReport>>>('/admin/reports', { params })).data.data,
  getReport: async (id: string): Promise<AdminReportDetail> => (await apiClient.get<ApiResponse<AdminReportDetail>>(`/admin/reports/${id}`)).data.data,
  reviewReport: async (id: string, body: { adminNote?: string }) => (await apiClient.post<ApiResponse<AdminReport>>(`/admin/reports/${id}/review`, body)).data.data,
  dismissReport: async (id: string, body: { moderationReason: string; adminNote?: string }) => (await apiClient.post<ApiResponse<AdminReport>>(`/admin/reports/${id}/dismiss`, body)).data.data,
  resolveReport: async (id: string, body: { action: string; moderationReason: string; adminNote?: string; suspendedUntil?: string; evidenceUrl?: string }) => (await apiClient.post<ApiResponse<AdminReport>>(`/admin/reports/${id}/resolve`, body)).data.data,
  getMonitoring: async (): Promise<MonitoringData> => (await apiClient.get<ApiResponse<MonitoringData>>('/admin/monitoring')).data.data,
  getActions: async (params: Record<string, unknown>): Promise<PageResponse<AdminAction>> => (await apiClient.get<ApiResponse<PageResponse<AdminAction>>>('/admin/actions', { params })).data.data,
};
