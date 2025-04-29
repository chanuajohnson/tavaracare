import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  UserCircle, 
  Calendar, 
  GraduationCap, 
  ClipboardList, 
  ListChecks, 
  FileText,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Briefcase,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Users
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useTracking } from "@/hooks/useTracking";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingProgress } from "@/hooks/useTrainingProgress";
import { ensureUserProfile } from "@/lib/profile-utils";
import { CareAssignmentCard } from "@/components/professional/CareAssignmentCard";
import { ProfessionalCalendar } from "@/components/professional/ProfessionalCalendar";
import { useCareShifts } from "@/hooks/useCareShifts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CareTeamMembersTab } from "@/components/professional/CareTeamMembersTab";

const initialSteps = [
  { 
    id: 1, 
    title: "Complete your profile", 
    description: "Add your qualifications, experience, and preferences", 
    completed: false, 
    link: "/registration/professional",
    action: "complete" 
  },
  { 
    id: 2, 
    title: "Upload certifications", 
    description: "Share your professional certifications and required documents", 
    completed: false,
    link: "",
    action: "upload" 
  },
  { 
    id: 3, 
    title: "Set your availability", 
    description: "Let clients know when you're available for work", 
    completed: false,
    link: "",
    action: "availability" 
  },
  { 
    id: 4, 
    title: "Complete training", 
    description: "Learn essential caregiving techniques and protocols", 
    completed: false,
    link: "/professional/training-resources",
    action: "training" 
  },
  { 
    id: 5, 
    title: "Orientation and shadowing", 
    description: "Complete in-person orientation and care shadowing", 
    completed: false,
    link: "",
    action: "orientation" 
  }
];

const ProfessionalProfileHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackEngagement } = useTracking();
  const { toast: toastHook } = useToast();
  const { modules, loading: loadingModules, totalProgress } = useTrainingProgress();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoverAttempted, setRecoverAttempted] = useState(false);
  const [profileCreationAttempted, setProfileCreationAttempted] = useState(false);

  const [steps, setSteps] = useState(initialSteps);

  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [loadingCarePlans, setLoadingCarePlans] = useState(true);

  const [careTeamMembers, setCareTeamMembers] = useState<any[]>([]);
  const [loadingCareTeamMembers, setLoadingCareTeamMembers] = useState(true);

  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [otherAvailability, setOtherAvailability] = useState("");

  const { shifts, loading: loadingShifts } = useCareShifts();

  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Profile Hub",
      path: "/professional/profile",
    },
  ];

  useJourneyTracking({
    journeyStage: 'profile_management',
    additionalData: { page: 'professional_profile_hub' },
    trackOnce: true
  });

  useEffect(() => {
    if (!user && !loading) {
      toast.info("Authentication Required", {
        description: "Please log in to access your profile hub.",
      });
      navigate("/auth", { state: { returnPath: "/professional/profile" } });
    }
  }, [user, loading, navigate]);

  const recoverOnboardingProgress = async (userId: string) => {
    if (recoverAttempted) return false;
    
    try {
      setRecoverAttempted(true);
      console.log("Attempting to recover onboarding progress for user:", userId);
      
      const progressData = initialSteps.reduce((acc, step) => {
        acc[step.id] = false;
        return acc;
      }, {} as Record<number, boolean>);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_progress: progressData })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Error updating profile with default onboarding progress:", updateError);
        return false;
      }
      
      console.log("Successfully recovered onboarding progress data");
      return true;
    } catch (err) {
      console.error("Error in recovery attempt:", err);
      return false;
    }
  };

  const createProfileIfNeeded = async (userId: string) => {
    if (profileCreationAttempted) return false;
    
    try {
      setProfileCreationAttempted(true);
      console.log("Attempting to create profile for user:", userId);
      
      const result = await ensureUserProfile(userId, 'professional');
      
      if (!result.success) {
        console.error("Error creating profile:", result.error);
        return false;
      }
      
      console.log("Successfully created or verified professional profile");
      return true;
    } catch (err) {
      console.error("Error in profile creation attempt:", err);
      return false;
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        await createProfileIfNeeded(user.id);
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }
        
        if (!data) {
          console.log("No profile found after creation attempt, this should not happen");
          setError("Unable to load profile data. Please try again or contact support.");
          setLoading(false);
          return;
        }
        
        setProfileData(data);
        
        if (data.onboarding_progress) {
          try {
            const updatedSteps = [...initialSteps];
            Object.keys(data.onboarding_progress).forEach(stepId => {
              const index = updatedSteps.findIndex(s => s.id === parseInt(stepId));
              if (index >= 0) {
                updatedSteps[index].completed = data.onboarding_progress[stepId];
              }
            });
            setSteps(updatedSteps);
          } catch (parseError) {
            console.error("Error parsing onboarding progress:", parseError);
            const success = await recoverOnboardingProgress(user.id);
            if (!success) {
              setSteps(initialSteps);
            }
          }
        } else {
          const success = await recoverOnboardingProgress(user.id);
          if (!success) {
            setSteps(initialSteps);
          }
        }
        
        if (data.availability) {
          setSelectedAvailability(Array.isArray(data.availability) ? data.availability : []);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        
        if (err.message && (
            err.message.includes("onboarding_progress") || 
            err.message.includes("column") || 
            err.message.includes("does not exist"))) {
          
          if (user && await recoverOnboardingProgress(user.id)) {
            loadProfileData();
            return;
          }
        }
        
        setError(`Failed to load profile data: ${err.message || "Unknown error"}. Please try again.`);
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user]);

  const loadCarePlans = async () => {
    try {
      setLoadingCarePlans(true);
      setLoadingCareTeamMembers(true);
      
      if (!user) {
        console.log("No user found, skipping care plans fetch");
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      console.log("Fetching care plans for professional user:", user.id);
      
      // STEP 1: Get all care team assignments for this professional
      const { data: careTeamAssignments, error: teamAssignmentsError } = await supabase
        .from('care_team_members')
        .select(`
          id, 
          care_plan_id, 
          family_id, 
          caregiver_id, 
          role, 
          status, 
          notes, 
          created_at
        `)
        .eq('caregiver_id', user.id);
      
      if (teamAssignmentsError) {
        console.error("Error fetching care team assignments:", teamAssignmentsError);
        throw teamAssignmentsError;
      }
      
      console.log("Raw care team assignments:", careTeamAssignments);
      console.log("Total care team assignments found:", careTeamAssignments?.length || 0);
      
      if (!careTeamAssignments || careTeamAssignments.length === 0) {
        console.log("No care team assignments found for user");
        setCarePlans([]);
        setCareTeamMembers([]);
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      // STEP 2: Extract all care plan IDs from assignments
      const carePlanIds = careTeamAssignments
        .map(assignment => assignment.care_plan_id)
        .filter(id => id !== null && id !== undefined) as string[];
      
      console.log("Care plan IDs to fetch:", carePlanIds);
      console.log("Number of care plan IDs to fetch:", carePlanIds.length);
      
      if (carePlanIds.length === 0) {
        console.log("No valid care plan IDs found");
        setCarePlans([]);
        setCareTeamMembers([]);
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      // STEP 3: Fetch care plan details
      const { data: carePlansData, error: carePlansError } = await supabase
        .from('care_plans')
        .select(`
          id, 
          title, 
          description, 
          status, 
          family_id
        `)
        .in('id', carePlanIds);
      
      if (carePlansError) {
        console.error("Error fetching care plans:", carePlansError);
        throw carePlansError;
      }
      
      console.log("Raw care plans data:", carePlansData);
      console.log("Number of care plans retrieved:", carePlansData?.length || 0);
      
      if (!carePlansData || carePlansData.length === 0) {
        console.log("No care plans found with the given IDs");
        setCarePlans([]);
        setCareTeamMembers([]);
        setLoadingCarePlans(false);
        setLoadingCareTeamMembers(false);
        return;
      }
      
      // STEP 4: Fetch family profiles for all care plans
      const familyIds = [...new Set((carePlansData || [])
        .map(plan => plan.family_id)
        .filter(id => id !== null && id !== undefined))];
      
      console.log("Family IDs to fetch:", familyIds);
      
      let familyProfiles = [];
      if (familyIds.length > 0) {
        const { data: familyProfilesData, error: familyProfilesError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            avatar_url, 
            phone_number
          `)
          .in('id', familyIds);
        
        if (familyProfilesError) {
          console.error("Error fetching family profiles:", familyProfilesError);
          throw familyProfilesError;
        }
        
        familyProfiles = familyProfilesData || [];
        console.log("Raw family profiles data:", familyProfiles);
      }
      
      // STEP 5: Build transformed care plans with standardized naming and proper validation
      const transformedCarePlans = [];
      
      for (const assignment of careTeamAssignments) {
        // Skip assignments without care_plan_id
        if (!assignment.care_plan_id) {
          console.warn("Skipping assignment without care_plan_id:", assignment);
          continue;
        }
        
        // Find matching care plan
        const carePlan = carePlansData.find(plan => plan.id === assignment.care_plan_id);
        
        // Skip if no matching care plan
        if (!carePlan) {
          console.warn(`No care plan found for assignment ${assignment.id} with plan ID ${assignment.care_plan_id}`);
          continue;
        }
        
        // Find family profile with fallback
        const familyProfile = familyProfiles.find(profile => profile.id === carePlan.family_id) || {
          id: carePlan.family_id,
          full_name: "Family",
          avatar_url: null,
          phone_number: null
        };
        
        // Create transformed object with validated fields and standardized naming
        transformedCarePlans.push({
          id: assignment.id,
          care_plan_id: assignment.care_plan_id,
          family_id: carePlan.family_id,
          role: assignment.role || 'caregiver',
          status: assignment.status || 'pending',
          notes: assignment.notes,
          created_at: assignment.created_at,
          // Use singular care_plan instead of care_plans
          care_plan: {
            id: carePlan.id,
            title: carePlan.title || "Untitled Care Plan",
            description: carePlan.description || "No description provided",
            status: carePlan.status || "active",
            family_id: carePlan.family_id,
            // Use family_profile instead of profiles for consistent naming
            family_profile: familyProfile
          },
          // Keep care_plans for backward compatibility during transition
          care_plans: {
            id: carePlan.id,
            title: carePlan.title || "Untitled Care Plan",
            description: carePlan.description || "No description provided",
            status: carePlan.status || "active",
            family_id: carePlan.family_id,
            profiles: familyProfile
          }
        });
      }
      
      console.log("Transformed care plans:", transformedCarePlans);
      console.log("Number of transformed care plans:", transformedCarePlans.length);
      setCarePlans(transformedCarePlans);
      
      // STEP 6: Fetch ALL team members for these care plans
      const fetchCareTeamMembers = async () => {
        try {
          console.log("Starting to fetch care team members for all plans...");
          const allTeamMembers = [];
          
          for (const carePlanId of carePlanIds) {
            console.log(`Fetching team members for care plan: ${carePlanId}`);
            
            // Improved query to get all team members for this care plan, not just the current user
            const { data: teamMembers, error: membersError } = await supabase
              .from('care_team_members')
              .select(`
                id,
                care_plan_id,
                family_id,
                caregiver_id,
                role,
                status,
                notes,
                created_at,
                updated_at,
                profiles:caregiver_id (
                  full_name,
                  professional_type,
                  avatar_url
                )
              `)
              .eq('care_plan_id', carePlanId);
            
            if (membersError) {
              console.error(`Error fetching team members for plan ${carePlanId}:`, membersError);
              continue;
            }
            
            console.log(`Team members for plan ${carePlanId}:`, teamMembers);
            console.log(`Number of team members for plan ${carePlanId}:`, teamMembers?.length || 0);
            
            if (teamMembers && teamMembers.length > 0) {
              const formattedMembers = teamMembers.map(member => {
                const profileData = member.profiles || {};
                
                return {
                  id: member.id,
                  carePlanId: member.care_plan_id,
                  familyId: member.family_id,
                  caregiverId: member.caregiver_id,
                  role: member.role || 'caregiver',
                  status: member.status || 'invited',
                  notes: member.notes,
                  createdAt: member.created_at,
                  updatedAt: member.updated_at,
                  professionalDetails: {
                    full_name: typeof profileData === 'object' && profileData !== null 
                      ? (profileData as any).full_name || 'Unknown Professional' 
                      : 'Unknown Professional',
                    professional_type: typeof profileData === 'object' && profileData !== null 
                      ? (profileData as any).professional_type || 'Care Professional' 
                      : 'Care Professional',
                    avatar_url: typeof profileData === 'object' && profileData !== null 
                      ? (profileData as any).avatar_url 
                      : null
                  }
                };
              });
              
              allTeamMembers.push(...formattedMembers);
            }
          }
          
          console.log("All team members data:", allTeamMembers);
          console.log("Total team members count:", allTeamMembers.length);
          setCareTeamMembers(allTeamMembers);
        } catch (err) {
          console.error("Error processing team members:", err);
          setCareTeamMembers([]);
        } finally {
          setLoadingCareTeamMembers(false);
        }
      };
      
      fetchCareTeamMembers();
      setLoadingCarePlans(false);
    } catch (err) {
      console.error("Error loading care plans:", err);
      toast.error("Failed to load care assignments");
      setLoadingCarePlans(false);
      setLoadingCareTeamMembers(false);
      setCarePlans([]);
      setCareTeamMembers([]);
    }
  };

  useEffect(() => {
    loadCarePlans();
  }, [user]);

  const handleUploadCertificates = () => {
    trackEngagement('upload_documents_click', { section: 'profile_hub' });
    
    const updatedSteps = [...steps];
    const index = updatedSteps.findIndex(s => s.id === 2);
    if (index >= 0 && !updatedSteps[index].completed) {
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      if (user) {
        const progressData = updatedSteps.reduce((acc, step) => {
          acc[step.id] = step.completed;
          return acc;
        }, {} as Record<number, boolean>);
        
        supabase
          .from('profiles')
          .update({ onboarding_progress: progressData })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) console.error("Error updating progress:", error);
          });
      }
      
      trackEngagement('onboarding_step_complete', { 
        step: 'certificates',
        progress_percent: Math.round(((completedSteps + 1) / steps.length) * 100)
      });
    }
    
    toast.info("📩 Submit Your Documents", {
      description: "Please email or WhatsApp your documents, including certifications, ID, and Certificate of Character.",
      action: {
        label: "View Contact",
        onClick: () => {
          window.open("mailto:chanuajohnson@gmail.com", "_blank");
        }
      },
      duration: 5000,
    });
  };

  const saveAvailability = async () => {
    if (selectedAvailability.length === 0 && !otherAvailability) {
      toastHook({
        title: "Please select at least one option",
        description: "Choose when you're available to work",
        variant: "destructive",
      });
      return;
    }

    const finalAvailability = [...selectedAvailability];
    if (otherAvailability) {
      finalAvailability.push(`Other: ${otherAvailability}`);
    }

    setSelectedAvailability(finalAvailability);
    
    const updatedSteps = [...steps];
    const index = updatedSteps.findIndex(s => s.id === 3);
    if (index >= 0) {
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      trackEngagement('onboarding_step_complete', { 
        step: 'availability',
        progress_percent: Math.round(((completedSteps + 1) / steps.length) * 100)
      });
    }

    setIsAvailabilityModalOpen(false);
    
    if (user) {
      const progressData = updatedSteps.reduce((acc, step) => {
        acc[step.id] = step.completed;
        return acc;
      }, {} as Record<number, boolean>);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_progress: progressData,
          availability: finalAvailability
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error saving availability:", error);
        toastHook({
          title: "Error saving availability",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }
    }
    
    toast.success("Availability saved", {
      description: "Your availability preferences have been saved.",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderActionButton = (step: typeof initialSteps[0]) => {
    if (step.completed) return null;
    
    switch (step.action) {
      case "upload":
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-6 text-primary hover:text-primary-600"
            onClick={handleUploadCertificates}
          >
            Upload
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        );
      
      case "availability":
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-6 text-primary hover:text-primary-600"
            onClick={() => setIsAvailabilityModalOpen(true)}
          >
            Set
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        );
      
      case "orientation":
        return null; // Admin controlled
      
      case "training":
      case "complete":
      default:
        return (
          <Link to={step.link}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 text-primary hover:text-primary-600"
            >
              Complete
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <h1 className="text-3xl font-bold mb-6">Professional Profile Hub</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-12 w-full mb-6" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-2xl mx-auto">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
              <p className="mb-6 text-gray-600">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()}>Reload Page</Button>
                <div className="flex justify-center mt-4">
                  <Link to="/dashboard/professional">
                    <Button variant="outline">Return to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg max-w-2xl mx-auto">
              <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
              <p className="mb-6 text-gray-600">Please log in to view your professional profile hub.</p>
              <Link to="/auth">
                <Button>Log In or Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold">Professional Profile Hub</h1>
            <p className="text-muted-foreground">
              Manage your profile, availability, training progress, and care assignments
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-primary" />
                      Profile Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={profileData?.avatar_url} alt={profileData?.full_name || 'User'} />
                        <AvatarFallback className="text-2xl bg-primary text-white">
                          {getInitials(profileData?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold">{profileData?.full_name || 'Professional User'}</h3>
                      <p className="text-muted-foreground">{profileData?.professional_type || 'Caregiver'}</p>
                      
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {profileData?.years_of_experience && (
                          <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                            {profileData.years_of_experience} Experience
                          </Badge>
                        )}
                        
                        {profileData?.work_type && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {profileData.work_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      {profileData?.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{profileData.phone_number}</span>
                        </div>
                      )}
                      
                      {user?.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      
                      {profileData?.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{profileData.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3">
                      <Link to="/registration/professional">
                        <Button className="w-full">
                          Edit Profile Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAvailability && selectedAvailability.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAvailability.map((availability, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{availability}</span>
                          </div>
                        ))}
                        <div className="pt-3">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setIsAvailabilityModalOpen(true)}
                          >
                            Update Availability
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No availability set</h3>
                        <p className="text-gray-500 mb-4">
                          Let clients know when you're available to work
                        </p>
                        <Button onClick={() => setIsAvailabilityModalOpen(true)}>
                          Set Availability
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Onboarding Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Progress</span>
                        <span>{completedSteps}/{steps.length} steps</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      {steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {step.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{step.title}</h4>
                              {renderActionButton(step)}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div className="md:col-span-2">
              <Tabs defaultValue="assignments" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="assignments" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Care Assignments</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Care Teams</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </TabsTrigger>
                  <TabsTrigger value="training" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Training</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="assignments" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Care Assignments</CardTitle>
                      <CardDescription>
                        Families and care plans you're currently assigned to
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingCarePlans ? (
                        <div className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : carePlans.length > 0 ? (
                        <div className="space-y-4">
                          {carePlans.map((assignment) => (
                            <CareAssignmentCard key={assignment.id} assignment={assignment} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">No care assignments yet</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            You don't have any care assignments yet. 
                            Assignments will appear here once families add you to their care team.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="team" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Care Teams</CardTitle>
                      <CardDescription>
                        Other professionals you're working with on care plans
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingCareTeamMembers ? (
                        <div className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : careTeamMembers.length > 0 ? (
                        <CareTeamMembersTab careTeamMembers={careTeamMembers} />
                      ) : (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">No care teams yet</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            You're not part of any care teams yet. 
                            Team members will appear here once you're assigned to shared care plans.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="calendar" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Care Calendar</CardTitle>
                      <CardDescription>
                        Your upcoming shifts and care appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingShifts ? (
                        <div className="space-y-4">
                          <Skeleton className="h-64 w-full" />
                        </div>
                      ) : (
                        <ProfessionalCalendar shifts={shifts} />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="training" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Training Progress</CardTitle>
                      <CardDescription>
                        Your professional development and training modules
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingModules ? (
                        <div className="space-y-4">
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span>Overall Progress</span>
                              <span>{totalProgress}% Complete</span>
                            </div>
                            <Progress value={totalProgress} className="h-2" />
                          </div>
                          
                          {modules.length > 0 ? (
                            <div className="space-y-4">
                              {modules.map((module, index) => (
                                <div key={index} className="border rounded-lg overflow-hidden">
                                  <div className="bg-gray-50 p-4">
                                    <h4 className="font-medium">{module.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                                  </div>
                                  <div className="p-4">
                                    <div className="space-y-2 mb-4">
                                      <div className="flex justify-between items-center text-sm">
                                        <span>{module.progress}% Complete</span>
                                        <span>{module.completedLessons}/{module.totalLessons} Lessons</span>
                                      </div>
                                      <Progress value={module.progress} className="h-1.5" />
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                      <Link to={`/professional/training-resources?module=${module.id}`}>
                                        Continue Training
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-lg font-medium mb-1">No training modules yet</h3>
                              <p className="text-gray-500 max-w-md mx-auto mb-4">
                                Training modules will be assigned to you based on your role and experience.
                              </p>
                              <Button asChild variant="outline">
                                <Link to="/professional/training-resources">
                                  Browse Training Resources
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Availability</DialogTitle>
            <DialogDescription>
              Choose when you're available to work. This helps families find the right care professional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Shift Types</Label>
              <ToggleGroup 
                type="multiple" 
                className="flex flex-wrap justify-start gap-2"
                value={selectedAvailability}
                onValueChange={(value) => setSelectedAvailability(value)}
              >
                <ToggleGroupItem value="Weekday Mornings" className="gap-1">
                  <Sun className="h-4 w-4" />
                  <span>Weekday AM</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Weekday Afternoons" className="gap-1">
                  <Sun className="h-4 w-4" />
                  <span>Weekday PM</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Weekday Evenings" className="gap-1">
                  <Moon className="h-4 w-4" />
                  <span>Weekday Eve</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Weekend Mornings" className="gap-1">
                  <Sun className="h-4 w-4" />
                  <span>Weekend AM</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Weekend Afternoons" className="gap-1">
                  <Sun className="h-4 w-4" />
                  <span>Weekend PM</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Weekend Evenings" className="gap-1">
                  <Moon className="h-4 w-4" />
                  <span>Weekend Eve</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="Overnight" className="gap-1">
                  <Moon className="h-4 w-4" />
                  <span>Overnight</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="24-Hour Care" className="gap-1">
                  <Clock className="h-4 w-4" />
                  <span>24-Hour</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="On-Call" className="gap-1">
                  <Phone className="h-4 w-4" />
                  <span>On-Call</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other-availability">Other Availability</Label>
              <input
                id="other-availability"
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="e.g., Only available during summer months"
                value={otherAvailability}
                onChange={(e) => setOtherAvailability(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAvailabilityModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveAvailability}>Save Availability</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalProfileHub;
