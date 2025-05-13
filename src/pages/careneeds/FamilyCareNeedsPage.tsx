import React, { useState, useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { FadeIn, SlideIn } from "@/components/framer";

// Import care needs components
import { CognitiveMemorySection } from "@/components/careneeds/CognitiveMemorySection";
import { DailyLivingSection } from "@/components/careneeds/DailyLivingSection";
import { EmergencySection } from "@/components/careneeds/EmergencySection";
import { HousekeepingSection } from "@/components/careneeds/HousekeepingSection";
import { MedicalConditionsSection } from "@/components/careneeds/MedicalConditionsSection";
import { ScheduleInformationCard } from "@/components/careneeds/ScheduleInformationCard";
import { ShiftPreferencesSection } from "@/components/careneeds/ShiftPreferencesSection";

const FamilyCareNeedsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Daily Living
    assistance_bathing: false,
    assistance_dressing: false,
    assistance_feeding: false,
    assistance_mobility: false,
    assistance_toileting: false,
    assistance_medication: false,
    assistance_oral_care: false,
    assistance_naps: false,
    
    // Cognitive & Memory
    memory_reminders: false,
    wandering_prevention: false,
    fall_monitoring: false,
    gentle_engagement: false,
    assistance_companionship: false,
    dementia_redirection: false,
    
    // Housekeeping
    meal_prep: false,
    tidy_room: false,
    laundry_support: false,
    grocery_runs: false,
    
    // Medical
    equipment_use: false,
    vitals_check: false,
    
    // Additional Services
    escort_to_appointments: false,
    fresh_air_walks: false,
    
    // Communication & Emergency
    daily_report_required: false,
    communication_method: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Schedule
    plan_type: 'scheduled',
    preferred_time_start: '',
    preferred_time_end: '',
    preferred_days: [],
    weekday_coverage: 'none',
    weekend_coverage: 'no',
    weekend_schedule_type: 'none',
    
    // Medical Conditions
    diagnosed_conditions: '',
    cognitive_notes: '',
    
    // Additional Notes
    additional_notes: '',
  });
  
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard/family",
    },
    {
      label: "Care Needs",
      path: "/careneeds",
    },
  ];
  
  useEffect(() => {
    if (user) {
      loadCareNeeds();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const loadCareNeeds = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('care_needs_family')
        .select('*')
        .eq('profile_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setFormData({
          ...formData,
          ...data
        });
      }
    } catch (error) {
      console.error('Error loading care needs:', error);
      toast.error('Failed to load care needs information');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to save care needs');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const careNeedsData = {
        ...formData,
        profile_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      // Check if record exists
      const { data, error } = await supabase
        .from('care_needs_family')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      let result;
      
      if (data) {
        // Update existing record
        result = await supabase
          .from('care_needs_family')
          .update(careNeedsData)
          .eq('profile_id', user.id);
      } else {
        // Create new record
        result = await supabase
          .from('care_needs_family')
          .insert({
            ...careNeedsData,
            created_at: new Date().toISOString()
          });
      }
      
      if (result.error) throw result.error;
      
      toast.success('Care needs saved successfully!');
      
      // Update onboarding progress if needed
      const { error: progressError } = await supabase
        .from('profiles')
        .update({
          onboarding_progress: {
            completedSteps: {
              care_needs: true
            }
          }
        })
        .eq('id', user.id);
      
      if (progressError) {
        console.error('Error updating onboarding progress:', progressError);
      }
      
    } catch (error) {
      console.error('Error saving care needs:', error);
      toast.error('Failed to save care needs information');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <SlideIn
          direction="up"
          duration={0.5}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Care Needs Assessment</h1>
              <p className="text-muted-foreground mt-1">
                Help us understand the specific care needs for your loved one
              </p>
            </div>
          </div>
        </SlideIn>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <FadeIn duration={0.5} delay={0.1}>
                  <DailyLivingSection 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
                
                <FadeIn duration={0.5} delay={0.2}>
                  <CognitiveMemorySection 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
                
                <FadeIn duration={0.5} delay={0.3}>
                  <HousekeepingSection 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
                
                <FadeIn duration={0.5} delay={0.4}>
                  <MedicalConditionsSection 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
              </div>
              
              <div className="space-y-8">
                <FadeIn duration={0.5} delay={0.2}>
                  <ScheduleInformationCard 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
                
                <FadeIn duration={0.5} delay={0.3}>
                  <ShiftPreferencesSection 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
                
                <FadeIn duration={0.5} delay={0.4}>
                  <EmergencySection 
                    formData={formData}
                    onChange={handleChange}
                  />
                </FadeIn>
                
                <FadeIn duration={0.5} delay={0.5}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Notes</CardTitle>
                      <CardDescription>
                        Share any additional information that might help with care
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        className="w-full p-2 border rounded-md min-h-[120px]"
                        placeholder="Any other details or special instructions..."
                        value={formData.additional_notes || ''}
                        onChange={(e) => handleChange('additional_notes', e.target.value)}
                      ></textarea>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
            
            <div className="flex justify-end mt-8 space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/family')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Care Needs'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FamilyCareNeedsPage;
