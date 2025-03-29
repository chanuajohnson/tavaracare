import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileSpreadsheet,
  HelpCircle,
  BookOpen
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
import { TrackableButton } from "@/components/tracking/TrackableButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useEffect(() => {
    const loadCarePlans = async () => {
      if (!user) {
        setLoadingCarePlans(false);
        return;
      }

      try {
        setLoadingCarePlans(true);
        
        console.log("Fetching care plans for professional user:", user.id);
        
        const { data, error: carePlansError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            status,
            role,
            care_plan_id,
            notes,
            created_at,
            care_plans:care_plans(
              id,
              title,
              description,
              status,
              family_id,
              created_at,
              updated_at,
              metadata,
              profiles:profiles!care_plans_family_id_fkey(
                full_name,
                avatar_url,
                phone_number
              )
            )
          `)
          .eq('caregiver_id', user.id);
        
        if (carePlansError) {
          console.error("Error fetching care plans:", carePlansError);
          throw carePlansError;
        }
        
        console.log("Loaded care plans for professional:", data);
        
        const validCarePlans = data?.filter(plan => plan.care_plans) || [];
        console.log("Valid care plans after filtering:", validCarePlans.length);
        
        setCarePlans(validCarePlans);
        setLoadingCarePlans(false);
      } catch (err) {
        console.error("Error loading care plans:", err);
        toast.error("Failed to load care assignments");
        setLoadingCarePlans(false);
      }
    };
    
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

  const trackJobLetterRequest = (method: 'email' | 'whatsapp') => {
    trackEngagement(`job_letter_request_${method}`, { 
      section: 'admin_assistant',
      source: 'profile_hub'
    });
    
    toast.success(`Job letter request initiated via ${method}`, {
      description: "We've received your request and will process it shortly.",
    });
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
                      <div className="text-center py-6 space-y-4">
                        <Clock className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500">No availability set yet</p>
                        <Button 
                          onClick={() => setIsAvailabilityModalOpen(true)}
                          className="w-full"
                        >
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
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Training Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="font-medium">{totalProgress}%</span>
                    </div>
                    <Progress value={totalProgress} className="h-2" />
                    
                    {loadingModules ? (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-2 mt-4">
                        {modules.slice(0, 3).map((module) => (
                          <div key={module.id} className="text-sm">
                            <div className="flex justify-between items-center">
                              <span className="line-clamp-1">{module.title}</span>
                              <span className="text-xs font-medium">{module.progress}%</span>
                            </div>
                            <Progress value={module.progress} className="h-1 mt-1" />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-3">
                      <Link to="/professional/training-resources">
                        <Button 
                          variant="outline" 
                          className="w-full flex justify-between items-center"
                        >
                          <span>View Training Center</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Tabs defaultValue="next-steps" className="w-full">
                  <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                    <TabsTrigger value="next-steps" className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      <span>Next Steps</span>
                    </TabsTrigger>
                    <TabsTrigger value="care-plans" className="flex items-center gap-1">
                      <ClipboardList className="h-4 w-4" />
                      <span>Care Assignments</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin-assist" className="flex items-center gap-1">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Admin Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="next-steps" className="space-y-6">
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <ListChecks className="h-5 w-5 text-primary" />
                          Next Steps
                        </CardTitle>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Your onboarding progress</p>
                          <div className="flex items-center space-x-1">
                            <p className="text-sm font-medium">{progress}%</p>
                            <Progress 
                              value={progress} 
                              className="w-24 h-2"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {steps.map((step) => (
                            <li key={step.id} className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {step.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                    {step.title}
                                  </p>
                                  {!step.completed && (
                                    <div className="flex items-center text-xs text-gray-500 gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Pending</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{step.description}</p>
                                
                                {step.id === 2 && (
                                  <div className="mt-1 flex flex-col space-y-1">
                                    <a 
                                      href="mailto:chanuajohnson@gmail.com" 
                                      className="text-sm text-primary hover:underline flex items-center"
                                    >
                                      <Mail className="h-3 w-3 mr-1" /> E-mail
                                    </a>
                                    <a 
                                      href="https://wa.me/18687865357" 
                                      className="text-sm text-primary hover:underline flex items-center"
                                    >
                                      <Phone className="h-3 w-3 mr-1" /> WhatsApp
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {renderActionButton(step)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Your Certifications and Credentials
                        </CardTitle>
                        <CardDescription>
                          Professional qualifications and documentation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(profileData?.certifications && profileData.certifications.length > 0) ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {profileData.certifications.map((cert: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-2 rounded-md border bg-gray-50">
                                  <Award className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm">{cert}</span>
                                </div>
                              ))}
                              {profileData
