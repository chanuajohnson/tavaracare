
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftCoverageService } from '@/services/shiftCoverageService';
import { useAuthSession } from '@/hooks/auth/useAuthSession';

export const useFamilyShiftCoverage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();

  // Get pending requests for family approval
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['family-pending-requests', user?.id],
    queryFn: () => user ? shiftCoverageService.getPendingRequestsForFamily(user.id) : [],
    enabled: !!user,
  });

  // Get pending claims for family confirmation
  const { data: pendingClaims, isLoading: claimsLoading } = useQuery({
    queryKey: ['family-pending-claims', user?.id],
    queryFn: () => user ? shiftCoverageService.getPendingClaimsForFamily(user.id) : [],
    enabled: !!user,
  });

  // Respond to coverage request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: shiftCoverageService.respondToCoverageRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['available-shifts'] });
    },
  });

  // Respond to claim mutation
  const respondToClaimMutation = useMutation({
    mutationFn: ({ claimId, confirmed }: { claimId: string; confirmed: boolean }) =>
      shiftCoverageService.respondToClaim(claimId, confirmed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-pending-claims'] });
      queryClient.invalidateQueries({ queryKey: ['care-shifts'] });
    },
  });

  return {
    pendingRequests,
    pendingClaims,
    isLoading: requestsLoading || claimsLoading,
    respondToRequest: respondToRequestMutation.mutate,
    respondToClaim: respondToClaimMutation.mutate,
    isRespondingToRequest: respondToRequestMutation.isPending,
    isRespondingToClaim: respondToClaimMutation.isPending,
  };
};
