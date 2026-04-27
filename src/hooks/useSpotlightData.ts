import { useQuery } from "@tanstack/react-query";
import { spotlightService, SpotlightCaregiver, CaregiverTestimonial } from "@/services/spotlightService";

export const useSpotlightCaregivers = () => {
  return useQuery<SpotlightCaregiver[], Error>({
    queryKey: ["spotlight-caregivers"],
    queryFn: () => spotlightService.getActiveSpotlightCaregivers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCaregiverTestimonials = (caregiverId: string | undefined) => {
  return useQuery<CaregiverTestimonial[], Error>({
    queryKey: ["caregiver-testimonials", caregiverId],
    queryFn: () => spotlightService.getCaregiverTestimonials(caregiverId!),
    enabled: !!caregiverId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllTestimonials = () => {
  return useQuery<CaregiverTestimonial[], Error>({
    queryKey: ["all-testimonials"],
    queryFn: () => spotlightService.getAllApprovedTestimonials(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUrgentCaregivers = () => {
  return useQuery({
    queryKey: ["urgent-caregivers"],
    queryFn: () => spotlightService.getUrgentAvailableCaregivers(),
    staleTime: 5 * 60 * 1000,
  });
};
