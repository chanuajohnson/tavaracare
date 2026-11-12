import { supabase } from "@/integrations/supabase/client";

export interface SpotlightCaregiver {
  id: string;
  caregiverId: string;
  headline: string;
  description?: string;
  featuredImageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  profile: {
    id: string;
    fullName: string;
    firstName: string;
    avatarUrl?: string;
    address?: string;
    location?: string;
    phoneNumber?: string;
    caregiverSpecialties?: string[];
    yearsOfExperience?: string;
  };
}

export interface CaregiverTestimonial {
  id: string;
  caregiverId: string;
  familyName: string;
  familyRelationship?: string;
  content: string;
  rating?: number;
  carePeriodStart?: string;
  carePeriodEnd?: string;
  isVerified: boolean;
  isApproved: boolean;
  source?: string;
}

export const spotlightService = {
  /**
   * Everyone marked "available for matching", featured spotlight caregivers first.
   * Uses a safe public list: first name, photo, general area, services, experience only.
   */
  async getActiveSpotlightCaregivers(): Promise<SpotlightCaregiver[]> {
    const { data, error } = await (supabase as any).rpc("list_public_available_caregivers");
    if (error) {
      console.error("Error fetching available caregivers:", error);
      throw error;
    }
    return ((data as any[]) || []).map((item: any, index: number) => ({
      id: item.spotlight_id || item.caregiver_id,
      caregiverId: item.caregiver_id,
      headline: item.headline || "Caregiver ready to start",
      description: item.description || undefined,
      featuredImageUrl: item.featured_image_url || undefined,
      displayOrder: item.display_order ?? 1000 + index,
      isActive: true,
      isFeatured: !!item.is_featured,
      profile: {
        id: item.caregiver_id,
        fullName: item.first_name || "Caregiver",
        firstName: item.first_name || "Caregiver",
        avatarUrl: item.avatar_url && !/^(undefined|null)$/i.test(item.avatar_url) ? item.avatar_url : undefined,
        location: item.location || undefined,
        caregiverSpecialties: item.care_services || [],
        yearsOfExperience: item.years_of_experience || undefined,
      },
    }));
  },

  async getCaregiverTestimonials(caregiverId: string): Promise<CaregiverTestimonial[]> {
    const { data, error } = await supabase
      .from("caregiver_testimonials")
      .select("*")
      .eq("caregiver_id", caregiverId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }

    return (data || []).map((item) => ({
      id: item.id,
      caregiverId: item.caregiver_id,
      familyName: item.family_name,
      familyRelationship: item.family_relationship,
      content: item.content,
      rating: item.rating,
      carePeriodStart: item.care_period_start,
      carePeriodEnd: item.care_period_end,
      isVerified: item.is_verified,
      isApproved: item.is_approved,
      source: item.source,
    }));
  },

  async getAllApprovedTestimonials(): Promise<CaregiverTestimonial[]> {
    const { data, error } = await supabase
      .from("caregiver_testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching all testimonials:", error);
      throw error;
    }

    return (data || []).map((item) => ({
      id: item.id,
      caregiverId: item.caregiver_id,
      familyName: item.family_name,
      familyRelationship: item.family_relationship,
      content: item.content,
      rating: item.rating,
      carePeriodStart: item.care_period_start,
      carePeriodEnd: item.care_period_end,
      isVerified: item.is_verified,
      isApproved: item.is_approved,
      source: item.source,
    }));
  },

  async getUrgentAvailableCaregivers(): Promise<any[]> {
    const { data, error } = await supabase
      .from("urgent_availability")
      .select("*")
      .eq("status", "available")
      .order("featured_order", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching urgent caregivers:", error);
      throw error;
    }

    return data || [];
  },
};
