import { supabase } from "@/integrations/supabase/client";

export interface TestimonialInput {
  caregiverId: string;
  familyName: string;
  familyRelationship?: string;
  content: string;
  rating?: number;
  carePeriodStart?: string;
  carePeriodEnd?: string;
  source?: string;
}

export interface Testimonial {
  id: string;
  caregiverId: string;
  familyId?: string;
  familyName: string;
  familyRelationship?: string;
  content: string;
  rating?: number;
  carePeriodStart?: string;
  carePeriodEnd?: string;
  isApproved: boolean;
  isVerified: boolean;
  source?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  caregiverName?: string;
}

export const adminTestimonialService = {
  async createTestimonial(input: TestimonialInput): Promise<Testimonial> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("caregiver_testimonials")
      .insert({
        caregiver_id: input.caregiverId,
        family_name: input.familyName,
        family_relationship: input.familyRelationship,
        content: input.content,
        rating: input.rating,
        care_period_start: input.carePeriodStart,
        care_period_end: input.carePeriodEnd,
        source: input.source || "manual_entry",
        is_approved: false,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }

    return mapTestimonial(data);
  },

  async updateTestimonialStatus(
    id: string,
    isApproved: boolean
  ): Promise<Testimonial> {
    const { data: userData } = await supabase.auth.getUser();
    
    const updateData: any = {
      is_approved: isApproved,
    };

    if (isApproved) {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = userData?.user?.id;
    }

    const { data, error } = await supabase
      .from("caregiver_testimonials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating testimonial status:", error);
      throw error;
    }

    return mapTestimonial(data);
  },

  async updateTestimonial(
    id: string,
    input: Partial<TestimonialInput>
  ): Promise<Testimonial> {
    const updateData: any = {};
    
    if (input.caregiverId) updateData.caregiver_id = input.caregiverId;
    if (input.familyName) updateData.family_name = input.familyName;
    if (input.familyRelationship !== undefined) updateData.family_relationship = input.familyRelationship;
    if (input.content) updateData.content = input.content;
    if (input.rating !== undefined) updateData.rating = input.rating;
    if (input.carePeriodStart !== undefined) updateData.care_period_start = input.carePeriodStart;
    if (input.carePeriodEnd !== undefined) updateData.care_period_end = input.carePeriodEnd;

    const { data, error } = await supabase
      .from("caregiver_testimonials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating testimonial:", error);
      throw error;
    }

    return mapTestimonial(data);
  },

  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase
      .from("caregiver_testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting testimonial:", error);
      throw error;
    }
  },

  async getAllTestimonials(status?: "pending" | "approved" | "rejected"): Promise<Testimonial[]> {
    let query = supabase
      .from("caregiver_testimonials")
      .select(`
        *,
        profiles:caregiver_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (status === "pending") {
      query = query.eq("is_approved", false);
    } else if (status === "approved") {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      ...mapTestimonial(item),
      caregiverName: item.profiles?.full_name || "Unknown",
    }));
  },

  async getProfessionalCaregivers(): Promise<{ id: string; fullName: string }[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "professional")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching caregivers:", error);
      throw error;
    }

    return (data || []).map((item) => ({
      id: item.id,
      fullName: item.full_name || "Unknown",
    }));
  },
};

function mapTestimonial(item: any): Testimonial {
  return {
    id: item.id,
    caregiverId: item.caregiver_id,
    familyId: item.family_id,
    familyName: item.family_name,
    familyRelationship: item.family_relationship,
    content: item.content,
    rating: item.rating,
    carePeriodStart: item.care_period_start,
    carePeriodEnd: item.care_period_end,
    isApproved: item.is_approved,
    isVerified: item.is_verified,
    source: item.source,
    createdAt: item.created_at,
    approvedAt: item.approved_at,
    approvedBy: item.approved_by,
  };
}
