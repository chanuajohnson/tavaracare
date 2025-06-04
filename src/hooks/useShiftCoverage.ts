
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftCoverageService } from '@/services/shiftCoverageService';
import { useAuthSession } from '@/hooks/auth/useAuthSession';

export const useShiftCoverage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();

  // Get coverage requests for current user
  const { data: myRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['coverage-requests', user?.id],
    queryFn: () => user ? shiftCoverageService.getCoverageRequestsForCaregiver(user.id) : [],
    enabled: !!user,
  });

  // Get available shifts to claim
  const { data: availableShifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['available-shifts', user?.id],
    queryFn: () => user ? shiftCoverageService.getAvailableShifts(user.id) : [],
    enabled: !!user,
  });

  // Get notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['shift-notifications', user?.id],
    queryFn: () => user ? shiftCoverageService.getNotificationsForUser(user.id) : [],
    enabled: !!user,
  });

  // Create coverage request mutation
  const createRequestMutation = useMutation({
    mutationFn: shiftCoverageService.createCoverageRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shift-notifications'] });
    },
  });

  // Claim shift mutation
  const claimShiftMutation = useMutation({
    mutationFn: shiftCoverageService.claimShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['shift-notifications'] });
    },
  });

  return {
    myRequests,
    availableShifts,
    notifications,
    isLoading: requestsLoading || shiftsLoading || notificationsLoading,
    createRequest: createRequestMutation.mutate,
    claimShift: claimShiftMutation.mutate,
    isCreatingRequest: createRequestMutation.isPending,
    isClaimingShift: claimShiftMutation.isPending,
  };
};
