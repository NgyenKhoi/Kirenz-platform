import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useAdminUsers(params: Record<string, unknown>, selectedId?: string) {
  const client = useQueryClient();
  const users = useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminService.getUsers(params) });
  const actions = useQuery({ queryKey: ['admin', 'users', selectedId, 'actions'], queryFn: () => adminService.getUserActions(selectedId!), enabled: Boolean(selectedId) });
  const invalidate = async () => { await client.invalidateQueries({ queryKey: ['admin', 'users'] }); };
  const ban = useMutation({ mutationFn: ({ id, ...body }: { id: string; reason: string; note?: string; evidenceUrl?: string }) => adminService.banUser(id, body), onSuccess: invalidate });
  const unban = useMutation({ mutationFn: ({ id, ...body }: { id: string; reason: string; note?: string }) => adminService.unbanUser(id, body), onSuccess: invalidate });
  const suspend = useMutation({ mutationFn: ({ id, ...body }: { id: string; suspendedUntil: string; moderationReason: string; note?: string; evidenceUrl?: string }) => adminService.suspendUser(id, body), onSuccess: invalidate });
  const warn = useMutation({ mutationFn: ({ id, ...body }: { id: string; reason: string; message: string; note?: string; evidenceUrl?: string }) => adminService.warnUser(id, body), onSuccess: async () => { await invalidate(); await actions.refetch(); } });
  return { users, actions, ban, unban, suspend, warn };
}
