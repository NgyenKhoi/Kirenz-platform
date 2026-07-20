export interface DashboardSummary {
  totalUsers: number;
  registrationsToday: number;
  registrationsThisWeek: number;
  registrationsThisMonth: number;
  bannedUsers: number;
  suspendedUsers: number;
  deactivatedUsers: number;
  pendingReports: number;
  reviewingReports: number;
  posts: number;
  comments: number;
  reactions: number;
  partialData: boolean;
  unavailableComponents: string[];
}

export interface UserGrowthPoint {
  period: string;
  count: number;
}

export interface ContentGrowthPoint {
  period: string;
  posts: number;
  comments: number;
  reactions: number;
}

export interface DashboardSeries<T> {
  series: T[];
  partialData: boolean;
  unavailableComponents: string[];
}

export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }
export interface AdminUser { id: string; email: string; username: string; displayName?: string; avatarUrl?: string; role: string; status: string; emailVerified: boolean; createdAt: string; lastLoginAt?: string; suspendedUntil?: string; }
export interface AdminAction { id: string; adminId: string; actionType: string; targetType: string; targetId: string; reason: string; note?: string; evidenceUrl?: string; createdAt: string; }
export interface AdminReport { id: string; reporterId: string; targetType: string; targetId: string; reason: string; description?: string; status: string; resolution?: string; createdAt: string; updatedAt: string; }
export interface ModerationContent { id: string; targetType: string; authorId: string; content: string; media: Array<{ url: string; type: string }>; status: string; parentId?: string; createdAt: string; updatedAt: string; }
export interface AdminReportDetail { report: AdminReport; aggregateReportCount: number; moderationReason?: string; adminNote?: string; targetContent?: ModerationContent; partialData: boolean; unavailableComponents: string[]; }
export type HealthStatus = 'UP' | 'DOWN' | 'UNKNOWN';
export interface InstanceHealth { instanceId: string; host: string; port: number; status: HealthStatus; latencyMs: number; checkedAt: string; }
export interface ServiceHealth { serviceName: string; status: HealthStatus; registeredInstances: number; instances: InstanceHealth[]; }
export interface InfrastructureHealth { component: string; status: HealthStatus; sources: string[]; }
export interface MonitoringData { services: ServiceHealth[]; infrastructure: InfrastructureHealth[]; partialData: boolean; checkedAt: string; }
