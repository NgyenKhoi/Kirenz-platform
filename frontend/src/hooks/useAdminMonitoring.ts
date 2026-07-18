import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useAdminMonitoring() {
  return useQuery({
    queryKey: ['admin', 'monitoring'],
    queryFn: adminService.getMonitoring,
    refetchInterval: () => document.visibilityState === 'visible' ? 30_000 : false,
  });
}
