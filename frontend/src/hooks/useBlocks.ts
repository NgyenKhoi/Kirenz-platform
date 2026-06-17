import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blockService } from '../services/block.service';

const blockedUsersQueryKey = ['blocked-users'];

export const useBlockedUsers = () => {
  return useQuery({
    queryKey: blockedUsersQueryKey,
    queryFn: blockService.getBlockedUsers,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockService.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockService.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
};
