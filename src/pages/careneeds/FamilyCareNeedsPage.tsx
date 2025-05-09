
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import * as z from "zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { FamilyCareNeeds } from "@/types/carePlan";
import { applyPrefillDataToForm, getPrefillDataFromUrl } from "@/utils/chat/prefillReader";
import { saveFamilyCareNeeds, generateDraftCarePlanFromCareNeeds } from "@/services/familyCareNeedsService";
import { createCarePlan } from "@/services/care-plans/carePlanService";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Form sections
import DailyLivingSection from "@/components/careneeds/DailyLivingSection";
import CognitiveMemorySection from "@/components/careneeds/CognitiveMemorySection";
import MedicalConditionsSection from "@/components/careneeds/MedicalConditionsSection";
import HousekeepingSection from "@/components/careneeds/HousekeepingSection";
import EmergencySection from "@/components/careneeds/EmergencySection";
import ShiftPreferencesSection from "@/components/careneeds/ShiftPreferencesSection";

const FormSchema = z.object({
  // Daily Living Assistance
  assistanceBathing: z.boolean().optional(),
  assistanceDressing: z.boolean().optional(),
  assistanceToileting: z.boolean().optional(),
  assistanceOralCare: z.boolean().optional(),
  assistanceFeeding: z.boolean().optional(),
  assistanceMobility: z.boolean().optional(),
  assistanceMedication: z.boolean().optional(),
  assistanceCompanionship: z.boolean().optional(),
  assistanceNaps: z.boolean().optional(),
  
  // Cognitive & Memory Support
  dementiaRedirection: z.boolean().optional(),
  memoryReminders: z.boolean().optional(),
  gentleEngagement: z.boolean().optional(),
  wanderingPrevention: z.boolean().optional(),
  cognitiveNotes: z.string().optional(),
  
  // Medical & Special Conditions
  diagnosedConditions: z.string().optional(),
  equipmentUse: z.boolean().optional(),
  fallMonitoring: z.boolean().optional(),
  vitalsCheck: z.boolean().optional(),
  
  // Housekeeping & Transportation
  tidyRoom: z.boolean().optional(),
  laundrySupport: z.boolean().optional(),
  groceryRuns: z.boolean().optional(),
  mealPrep: z.boolean().optional(),
  escortToAppointments: z.boolean().optional(),
  freshAirWalks: z.boolean().optional(),
  
  // Emergency & Communication
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  communicationMethod: z.string().optional(),
  dailyReportRequired: z.boolean().optional(),
  additionalNotes: z.string().optional(),

  // Shift preferences
  preferredDays: z.array(z.string()).optional(),
  preferredTimeStart: z.string().optional(),
  preferredTimeEnd: z.string().optional(),
});

const FamilyCareNeedsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      assistanceBathing: false,
      assistanceDressing: false,
      assistanceToileting: false,
      assistanceOralCare: false,
      assistanceFeeding: false,
      assistanceMobility: false,
      assistanceMedication: false,
      assistanceCompanionship: false,
      assistanceNaps: false,
      dementiaRedirection: false,
      memoryReminders: false,
      gentleEngagement: false,
      wanderingPrevention: false,
      equipmentUse: false,
      fallMonitoring: false,
      vitalsCheck: false,
      tidyRoom: false,
      laundrySupport: false,
      groceryRuns: false,
      mealPrep: false,
      escortToAppointments: false,
      freshAirWalks: false,
      dailyReportRequired: false,
      preferredDays: [],
    }
  });
  
  // Load data from previous registration
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;
      
      try {
        // First check if we have prefill data from URL
        const prefillData = getPrefillDataFromUrl();
        
        // If prefill data exists, use it to populate the form
        if (prefillData) {
          applyPrefillDataToForm((field, value) => {
            form.setValue(field as any, value);
          });
        }
        
        // Get profile data from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfileData(data);
          
          // Set form values from profile
          if (data.full_name) form.setValue('emergencyContactName', data.emergency_contact || '');
          if (data.care_recipient_name) {
            const careRecipientName = data.care_recipient_name;
            form.setValue('diagnosedConditions', data.special_needs ? data.special_needs.join(', ') : '');
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Could not load profile data");
      }
    };
    
    loadProfileData();
  }, [user?.id, form]);
  
  const onSubmit = async (formData: z.infer<typeof FormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to submit this form");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save the care needs data
      const careNeedsData: FamilyCareNeeds = {
        ...formData,
        profileId: user.id,
      };
      
      const savedCareNeeds = await saveFamilyCareNeeds(careNeedsData);
      
      if (!savedCareNeeds) {
        throw new Error("Failed to save care needs");
      }
      
      // Generate draft care plan
      const draftPlan = generateDraftCarePlanFromCareNeeds(
        savedCareNeeds,
        {
          careRecipientName: profileData?.care_recipient_name,
          relationship: profileData?.relationship,
          careTypes: profileData?.care_types
        }
      );
      
      // Create care plan in database
      const createdPlan = await createCarePlan({
        title: draftPlan.title,
        description: draftPlan.description,
        familyId: user.id,
        status: 'active',
        metadata: {
          planType: draftPlan.planType,
          customShifts: draftPlan.metadata.customShifts
        }
      });
      
      if (createdPlan) {
        console.log("Care plan created successfully with ID:", createdPlan.id);
        toast.success("Care plan draft created successfully");
        
        // Fix the navigation path - use the correct route format
        console.log("Preparing to navigate to care plan detail page");
        navigate(`/family/care-management/${createdPlan.id}`);
        console.log("Navigation triggered to:", `/family/care-management/${createdPlan.id}`);
      } else {
        console.log("Plan creation returned null or undefined, redirecting to create page");
        // If plan creation fails, still redirect to create page
        navigate('/family/care-management/create');
      }
    } catch (error) {
      console.error("Error on form submission:", error);
      toast.error("There was a problem submitting the form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Family Care Needs</h1>
          <p className="text-gray-500">
            Tell us about specific care needs to help us create your personalized care plan
          </p>
          <Separator className="my-6" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DailyLivingSection form={form} />
            <CognitiveMemorySection form={form} />
            <MedicalConditionsSection form={form} />
            <HousekeepingSection form={form} />
            <EmergencySection form={form} />
            <ShiftPreferencesSection form={form} />
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard/family')}
              >
                Back to Dashboard
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Saving..." : "Save and Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default FamilyCareNeedsPage;
