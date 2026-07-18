import { useQuery } from '@tanstack/react-query';
import { adminService, type DashboardRange } from '../services/admin.service';

export function useAdminDashboard(range: DashboardRange) {
  const summary = useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: adminService.getDashboardSummary,
  });
  const users = useQuery({
    queryKey: ['admin', 'dashboard', 'user-growth', range],
    queryFn: () => adminService.getUserGrowth(range),
  });
  const content = useQuery({
    queryKey: ['admin', 'dashboard', 'content-growth', range],
    queryFn: () => adminService.getContentGrowth(range),
  });

  return {
    summary,
    users,
    content,
    isLoading: summary.isLoading || users.isLoading || content.isLoading,
    isRefreshing: summary.isFetching || users.isFetching || content.isFetching,
    refresh: () => Promise.all([summary.refetch(), users.refetch(), content.refetch()]),
  };
}
