import { supabase } from "@/integrations/supabase/client";

export interface SpotlightCaregiver {
  id: string;
  caregiverId: string;
  headline: string;
  description?: string;
  featuredImageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  profile: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    address?: string;
    location?: string;
    phoneNumber?: string;
    caregiverSpecialties?: string[];
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
  async getActiveSpotlightCaregivers(): Promise<SpotlightCaregiver[]> {
    const { data, error } = await supabase
      .from("caregiver_spotlight")
      .select(`
        id,
        caregiver_id,
        headline,
        description,
        featured_image_url,
        display_order,
        is_active,
        profiles:caregiver_id (
          id,
          full_name,
          avatar_url,
          address,
          location,
          phone_number,
          care_services
        )
      `)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching spotlight caregivers:", error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      caregiverId: item.caregiver_id,
      headline: item.headline,
      description: item.description,
      featuredImageUrl: item.featured_image_url,
      displayOrder: item.display_order,
      isActive: item.is_active,
      profile: {
        id: item.profiles?.id || item.caregiver_id,
        fullName: item.profiles?.full_name || "Unknown",
        avatarUrl: item.profiles?.avatar_url,
        address: item.profiles?.address,
        location: item.profiles?.location,
        phoneNumber: item.profiles?.phone_number,
        caregiverSpecialties: item.profiles?.care_services || [],
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
