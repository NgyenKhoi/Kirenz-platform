import apiClient from '../config/api.config';
import type { ApiResponse } from '../types/auth.types';

export type ReportTargetType = 'POST' | 'USER';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'VIOLENCE' | 'NUDITY' | 'FALSE_INFORMATION' | 'IMPERSONATION' | 'OTHER';

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export const reportService = {
  create: async (request: CreateReportRequest): Promise<void> => {
    await apiClient.post<ApiResponse<unknown>>('/reports', request);
  },
};
