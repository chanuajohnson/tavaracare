
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CareNeedsFormData, initialFormData } from "./types";

export const useCareAssessmentForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CareNeedsFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadExistingAssessment();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadExistingAssessment = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setDataLoadError(null);
      
      console.log("Loading existing assessment for user:", user.id);
      
      const { data, error } = await supabase
        .from('care_needs_family')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading assessment:", error);
        setDataLoadError(error.message);
        return;
      }

      console.log("Assessment data loaded:", data);

      if (data) {
        setExistingAssessment(true);
        
        const mappedData: CareNeedsFormData = {
          care_recipient_name: "",
          primary_contact_name: "",
          primary_contact_phone: "",
          care_location: "",
          preferred_shift_start: data.preferred_time_start || "",
          preferred_shift_end: data.preferred_time_end || "",
          preferred_days: Array.isArray(data.preferred_days) ? data.preferred_days : [],
          
          assistance_bathing: data.assistance_bathing || false,
          assistance_dressing: data.assistance_dressing || false,
          assistance_toileting: data.assistance_toileting || false,
          assistance_oral_care: data.assistance_oral_care || false,
          assistance_feeding: data.assistance_feeding || false,
          assistance_mobility: data.assistance_mobility || false,
          assistance_medication: data.assistance_medication || false,
          assistance_companionship: data.assistance_companionship || false,
          assistance_naps: data.assistance_naps || false,
          
          dementia_redirection: data.dementia_redirection || false,
          memory_reminders: data.memory_reminders || false,
          gentle_engagement: data.gentle_engagement || false,
          wandering_prevention: data.wandering_prevention || false,
          triggers_soothing_techniques: data.cognitive_notes || "",
          
          diagnosed_conditions: data.diagnosed_conditions || "",
          chronic_illness_type: "",
          vitals_check: data.vitals_check || false,
          equipment_use: data.equipment_use || false,
          fall_monitoring: data.fall_monitoring || false,
          
          tidy_room: data.tidy_room || false,
          laundry_support: data.laundry_support || false,
          meal_prep: data.meal_prep || false,
          grocery_runs: data.grocery_runs || false,
          
          escort_to_appointments: data.escort_to_appointments || false,
          fresh_air_walks: data.fresh_air_walks || false,
          
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          emergency_contact_relationship: data.emergency_contact_relationship || "",
          known_allergies: "",
          emergency_plan: "",
          
          communication_method: data.communication_method || "text",
          daily_report_required: data.daily_report_required || false,
          checkin_preference: "",
          
          cultural_preferences: "",
          additional_notes: data.additional_notes || ""
        };
        
        setFormData(mappedData);
        console.log("Form data set:", mappedData);
      } else {
        console.log("No existing assessment found, using default form data");
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
      setDataLoadError("Failed to load assessment data");
      toast.error("Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: checked 
        ? [...prev.preferred_days, day]
        : prev.preferred_days.filter(d => d !== day)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to save assessment");
      return;
    }
    
    if (!formData.care_recipient_name.trim()) {
      toast.error("Please provide a care recipient name");
      return;
    }
    
    if (!formData.primary_contact_name.trim()) {
      toast.error("Please provide a primary contact name");
      return;
    }
    
    if (!formData.emergency_contact_name.trim()) {
      toast.error("Please provide an emergency contact name");
      return;
    }

    try {
      setSubmitting(true);

      const assessmentData = {
        profile_id: user.id,
        preferred_time_start: formData.preferred_shift_start,
        preferred_time_end: formData.preferred_shift_end,
        preferred_days: formData.preferred_days,
        
        assistance_bathing: formData.assistance_bathing,
        assistance_dressing: formData.assistance_dressing,
        assistance_toileting: formData.assistance_toileting,
        assistance_oral_care: formData.assistance_oral_care,
        assistance_feeding: formData.assistance_feeding,
        assistance_mobility: formData.assistance_mobility,
        assistance_medication: formData.assistance_medication,
        assistance_companionship: formData.assistance_companionship,
        assistance_naps: formData.assistance_naps,
        
        dementia_redirection: formData.dementia_redirection,
        memory_reminders: formData.memory_reminders,
        gentle_engagement: formData.gentle_engagement,
        wandering_prevention: formData.wandering_prevention,
        cognitive_notes: formData.triggers_soothing_techniques,
        
        diagnosed_conditions: formData.diagnosed_conditions,
        vitals_check: formData.vitals_check,
        equipment_use: formData.equipment_use,
        fall_monitoring: formData.fall_monitoring,
        
        tidy_room: formData.tidy_room,
        laundry_support: formData.laundry_support,
        meal_prep: formData.meal_prep,
        grocery_runs: formData.grocery_runs,
        
        escort_to_appointments: formData.escort_to_appointments,
        fresh_air_walks: formData.fresh_air_walks,
        
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        
        communication_method: formData.communication_method,
        daily_report_required: formData.daily_report_required,
        
        additional_notes: formData.additional_notes,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingAssessment) {
        const { error: updateError } = await supabase
          .from('care_needs_family')
          .update(assessmentData)
          .eq('profile_id', user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('care_needs_family')
          .insert(assessmentData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast.success(existingAssessment ? "Assessment updated successfully!" : "Assessment completed successfully!");
      navigate("/dashboard/family");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    loading,
    submitting,
    existingAssessment,
    dataLoadError,
    updateFormData,
    handleDayToggle,
    handleSubmit
  };
};
