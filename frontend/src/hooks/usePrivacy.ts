import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { privacyService } from '../services/privacy.service';

const privacySettingsQueryKey = ['privacy-settings'];

export const usePrivacySettings = () => {
  return useQuery({
    queryKey: privacySettingsQueryKey,
    queryFn: privacyService.getPrivacySettings,
  });
};

export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: privacyService.updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacySettingsQueryKey });
    },
  });
};
