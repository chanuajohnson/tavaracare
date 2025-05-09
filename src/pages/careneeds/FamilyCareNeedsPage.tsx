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
import { useTracking } from "@/hooks/useTracking";
import { parseScheduleString, determineWeekdayCoverage, determineWeekendCoverage, determineWeekendScheduleType } from "@/utils/scheduleUtils";

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
import ScheduleInformationCard from "@/components/careneeds/ScheduleInformationCard";

// Define valid care schedule types for type safety
type CareScheduleType = "8am-4pm" | "8am-6pm" | "6am-6pm" | "6pm-8am" | "none";
type WeekendScheduleType = "8am-6pm" | "6am-6pm" | "none";

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
});

const FamilyCareNeedsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [careSchedule, setCareSchedule] = useState<CareScheduleType | null>(null);
  const [weekendCoverage, setWeekendCoverage] = useState<WeekendScheduleType>("none");
  const navigate = useNavigate();
  const { trackEngagement } = useTracking();
  
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
          console.log("Retrieved profile data:", data);
          setProfileData(data);
          
          // Set form values from profile
          if (data.full_name) form.setValue('emergencyContactName', data.emergency_contact || '');
          if (data.care_recipient_name) {
            const careRecipientName = data.care_recipient_name;
            form.setValue('diagnosedConditions', data.special_needs ? data.special_needs.join(', ') : '');
          }
          
          // Extract schedule data from profile using new utility functions
          console.log("Care schedule from profile:", data.care_schedule);
          
          if (data.care_schedule) {
            // Parse the comma-separated string into an array
            const scheduleValues = parseScheduleString(data.care_schedule);
            console.log("Parsed schedule values:", scheduleValues);
            
            // Determine weekday coverage
            const weekdayCoverageValue = determineWeekdayCoverage(scheduleValues);
            console.log("Determined weekday coverage:", weekdayCoverageValue);
            setCareSchedule(weekdayCoverageValue);
            
            // Determine weekend coverage
            const hasWeekends = determineWeekendCoverage(scheduleValues);
            console.log("Has weekend coverage:", hasWeekends);
            
            // Determine weekend schedule type if weekend coverage is enabled
            if (hasWeekends === 'yes') {
              const weekendType = determineWeekendScheduleType(scheduleValues);
              console.log("Weekend schedule type:", weekendType);
              setWeekendCoverage(weekendType);
            } else {
              setWeekendCoverage('none');
            }
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
    console.log("Form submission started with data:", formData);
    console.log("Schedule data being submitted:", { 
      weekdayCoverage: careSchedule || "none", 
      weekendCoverage: weekendCoverage === "none" ? 'no' : 'yes',
      weekendScheduleType: weekendCoverage 
    });
    
    try {
      // Save the care needs data
      const careNeedsData: FamilyCareNeeds = {
        ...formData,
        profileId: user.id,
        // Use the schedule data with proper typing
        weekdayCoverage: careSchedule || "none",
        weekendCoverage: weekendCoverage === "none" ? 'no' : 'yes',
        weekendScheduleType: weekendCoverage, // Add the specific weekend schedule type
        planType: 'scheduled' // Default to scheduled
      };
      
      console.log("Sending care needs data to backend:", careNeedsData);
      
      const savedCareNeeds = await saveFamilyCareNeeds(careNeedsData);
      
      if (!savedCareNeeds) {
        throw new Error("Failed to save care needs");
      }
      
      console.log("Saved care needs:", savedCareNeeds);
      
      // Generate draft care plan
      const draftPlan = generateDraftCarePlanFromCareNeeds(
        savedCareNeeds,
        {
          careRecipientName: profileData?.care_recipient_name,
          relationship: profileData?.relationship,
          careTypes: profileData?.care_types
        }
      );
      
      console.log("Draft care plan generated:", draftPlan);
      
      // Create care plan in database
      const createdPlan = await createCarePlan({
        title: draftPlan.title,
        description: draftPlan.description,
        familyId: user.id,
        status: 'active',
        metadata: {
          planType: careSchedule ? 'scheduled' : 'on-demand',
          weekdayCoverage: careSchedule || 'none',
          weekendCoverage: weekendCoverage !== "none" ? 'yes' : 'no',
          weekendScheduleType: weekendCoverage, // Add the specific weekend schedule type
          // We don't need custom shifts from care needs anymore
          customShifts: []
        }
      });
      
      if (createdPlan) {
        console.log("Care plan created successfully with ID:", createdPlan.id);
        toast.success("Care plan created successfully!");
        
        // Track care needs completion
        await trackEngagement('care_needs_completed', {
          care_plan_id: createdPlan.id
        });
        
        // Navigate directly to the care plan detail page
        navigate(`/family/care-management/${createdPlan.id}`);
      } else {
        console.error("Plan creation returned null or undefined");
        toast.error("Failed to create care plan");
        navigate('/family/care-management');
      }
    } catch (error: any) {
      console.error("Error on form submission:", error);
      toast.error(error.message || "There was a problem submitting the form");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLaterClick = async () => {
    if (!user?.id) return;
    
    try {
      // Track that the user chose "Later"
      await trackEngagement('care_needs_deferred', {});
      
      // Navigate back to the dashboard
      navigate('/dashboard/family');
    } catch (error) {
      console.error("Error handling 'Later' click:", error);
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
        {/* New Care Needs Introduction Card */}
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl">Complete Your Care Needs Profile</CardTitle>
            <CardDescription>
              Tell us about specific care needs to help match you with the right caregivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Your care needs profile helps us understand your requirements and create a personalized care plan.
              This information will be used to match you with caregivers who have the right skills and experience.
            </p>
          </CardContent>
        </Card>
        
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
            
            {/* Display schedule information from registration */}
            <ScheduleInformationCard careSchedule={careSchedule || undefined} weekendCoverage={weekendCoverage} />
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleLaterClick}
              >
                Later
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Creating Care Plan..." : "Create Care Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default FamilyCareNeedsPage;
