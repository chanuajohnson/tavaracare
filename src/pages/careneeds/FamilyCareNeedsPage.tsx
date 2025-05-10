import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import * as z from "zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { FamilyCareNeeds } from "@/types/carePlan";
import { applyPrefillDataToForm, getPrefillDataFromUrl } from "@/utils/chat/prefillReader";
import { saveFamilyCareNeeds, fetchFamilyCareNeeds, generateDraftCarePlanFromCareNeeds } from "@/services/familyCareNeedsService";
import { createCarePlan, updateCarePlan, fetchCarePlanById } from "@/services/care-plans/carePlanService";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
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
  
  // Check for edit mode based on URL parameters
  useEffect(() => {
    const isEdit = searchParams.get('edit') === 'true';
    const planId = searchParams.get('careplan');
    
    if (isEdit && planId) {
      setIsEditMode(true);
      setCarePlanId(planId);
      console.log("Edit mode activated for care plan:", planId);
    } else {
      // Also check local storage as a fallback
      const storedPlanId = localStorage.getItem("edit_care_plan_id");
      if (storedPlanId) {
        setIsEditMode(true);
        setCarePlanId(storedPlanId);
        console.log("Edit mode activated from local storage for care plan:", storedPlanId);
      }
    }
  }, [searchParams]);
  
  // Load existing care needs data when in edit mode
  useEffect(() => {
    const loadExistingCareNeeds = async () => {
      if (!user?.id || !isEditMode) return;
      
      setIsLoading(true);
      try {
        const careNeeds = await fetchFamilyCareNeeds(user.id);
        console.log("Loaded existing care needs:", careNeeds);
        
        if (careNeeds) {
          // Set weekday and weekend coverage settings
          setCareSchedule(careNeeds.weekdayCoverage as CareScheduleType || null);
          setWeekendCoverage(careNeeds.weekendScheduleType as WeekendScheduleType || "none");
          
          // Populate form fields
          Object.entries(careNeeds).forEach(([key, value]) => {
            if (form.getValues(key as any) !== undefined) {
              form.setValue(key as any, value);
            }
          });
          
          toast.success("Loaded existing care needs data for editing");
        }
      } catch (error) {
        console.error("Error loading existing care needs:", error);
        toast.error("Could not load existing care needs data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingCareNeeds();
  }, [user?.id, isEditMode, form]);
  
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
          
          // Extract schedule data from profile using utility functions
          console.log("Care schedule from profile:", data.care_schedule);
          
          if (data.care_schedule) {
            // Parse the schedule data to ensure consistent format
            let scheduleValues = [];
            
            // Handle various formats that might be stored in the database
            if (typeof data.care_schedule === 'string') {
              // If it's a comma-separated string
              scheduleValues = parseScheduleString(data.care_schedule);
            } else if (Array.isArray(data.care_schedule)) {
              // If it's already an array
              scheduleValues = data.care_schedule;
            }
            
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

          // If we're in edit mode, see if we can get the schedule information from care plan directly
          if (isEditMode && carePlanId) {
            try {
              const carePlan = await fetchCarePlanById(carePlanId);
              if (carePlan && carePlan.metadata) {
                console.log("Retrieved care plan metadata for schedule:", carePlan.metadata);
                
                // Set the schedule data from care plan metadata (higher priority than profile)
                if (carePlan.metadata.weekdayCoverage) {
                  setCareSchedule(carePlan.metadata.weekdayCoverage as any);
                }
                
                if (carePlan.metadata.weekendCoverage === 'yes' && carePlan.metadata.weekendScheduleType) {
                  setWeekendCoverage(carePlan.metadata.weekendScheduleType as any);
                } else {
                  setWeekendCoverage('none');
                }
              }
            } catch (err) {
              console.error("Error fetching care plan schedule data:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Could not load profile data");
      }
    };
    
    loadProfileData();
  }, [user?.id, form, isEditMode, carePlanId]);
  
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
        weekdayCoverage: careSchedule || "none",
        weekendCoverage: weekendCoverage === "none" ? 'no' : 'yes',
        weekendScheduleType: weekendCoverage,
        planType: careSchedule ? 'scheduled' : 'on-demand'
      };
      
      console.log("Sending care needs data to backend:", careNeedsData);
      
      const savedCareNeeds = await saveFamilyCareNeeds(careNeedsData);
      
      if (!savedCareNeeds) {
        throw new Error("Failed to save care needs");
      }
      
      console.log("Saved care needs:", savedCareNeeds);
      
      // Update the user's profile with the care schedule information for consistency
      try {
        // Convert the schedule information to the array format used in profiles
        const scheduleArray: string[] = [];
        
        // Add weekday coverage to the schedule array
        if (careSchedule && careSchedule !== 'none') {
          scheduleArray.push(careSchedule);
        }
        
        // Add weekend coverage if enabled
        if (weekendCoverage && weekendCoverage !== 'none') {
          scheduleArray.push(`weekend_${weekendCoverage.replace('-', '_')}`);
        }
        
        console.log("Updating profile with schedule array:", scheduleArray);
        
        // Convert array to string for database compatibility
        const scheduleString = scheduleArray.join(',');
        
        await supabase
          .from('profiles')
          .update({
            care_schedule: scheduleString
          })
          .eq('id', user.id);
          
        console.log("Updated profile care_schedule");
      } catch (profileError) {
        console.error("Could not update profile schedule data:", profileError);
        // Non-blocking error, continue with the care plan updates
      }
      
      // Check if we're in edit mode
      if (isEditMode && carePlanId) {
        // Get the existing care plan
        const existingPlan = await fetchCarePlanById(carePlanId);
        if (!existingPlan) {
          throw new Error("Could not find the existing care plan");
        }
        
        // Update plan with the new metadata while preserving other fields
        await updateCarePlan(carePlanId, {
          ...existingPlan,
          metadata: {
            ...existingPlan.metadata,
            planType: careSchedule && careSchedule !== 'none' ? 'scheduled' : 'on-demand',
            weekdayCoverage: careSchedule || 'none',
            weekendCoverage: weekendCoverage !== "none" ? 'yes' : 'no',
            weekendScheduleType: weekendCoverage,
            customShifts: []
          }
        });
        
        console.log("Updated care plan metadata for care plan:", carePlanId);
        
        // Clear the stored edit ID
        localStorage.removeItem("edit_care_plan_id");
        
        toast.success("Care needs and plan updated successfully!");
        
        // Track care needs update
        await trackEngagement('care_needs_updated', {
          care_plan_id: carePlanId
        });
        
        // Navigate back to care plan detail
        navigate(`/family/care-management/${carePlanId}`);
      } else {
        // Generate draft care plan (original create flow)
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
            weekendScheduleType: weekendCoverage,
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
      // If in edit mode, just go back to the care plan
      if (isEditMode && carePlanId) {
        localStorage.removeItem("edit_care_plan_id");
        navigate(`/family/care-management/${carePlanId}`);
        return;
      }
      
      // Original behavior for non-edit mode
      await trackEngagement('care_needs_deferred', {});
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
        {/* Title Card */}
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-xl">
              {isEditMode ? "Edit Care Needs" : "Complete Your Care Needs Profile"}
            </CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Update the care needs for this care plan" 
                : "Tell us about specific care needs to help match you with the right caregivers"
              }
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
            {isEditMode 
              ? "Update the specific care needs for your personalized care plan" 
              : "Tell us about specific care needs to help us create your personalized care plan"
            }
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
                {isEditMode ? "Cancel" : "Later"}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading 
                  ? (isEditMode ? "Updating Care Needs..." : "Creating Care Plan...") 
                  : (isEditMode ? "Update Care Needs" : "Create Care Plan")
                }
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default FamilyCareNeedsPage;
