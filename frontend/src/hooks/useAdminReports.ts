import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useAdminReports(params: Record<string, unknown>, selectedId?: string) {
  const client = useQueryClient();
  const reports = useQuery({ queryKey: ['admin', 'reports', params], queryFn: () => adminService.getReports(params) });
  const detail = useQuery({ queryKey: ['admin', 'reports', selectedId], queryFn: () => adminService.getReport(selectedId!), enabled: Boolean(selectedId) });
  const invalidate = async () => { await client.invalidateQueries({ queryKey: ['admin', 'reports'] }); };
  const review = useMutation({ mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) => adminService.reviewReport(id, { adminNote }), onSuccess: invalidate });
  const dismiss = useMutation({ mutationFn: ({ id, ...body }: { id: string; moderationReason: string; adminNote?: string }) => adminService.dismissReport(id, body), onSuccess: invalidate });
  const resolve = useMutation({ mutationFn: ({ id, ...body }: { id: string; action: string; moderationReason: string; adminNote?: string; suspendedUntil?: string }) => adminService.resolveReport(id, body), onSuccess: invalidate });
  return { reports, detail, review, dismiss, resolve };
}
