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
