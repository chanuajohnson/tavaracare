
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Clock, Upload, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useTracking } from "@/hooks/useTracking";

export const NextStepsPanel = () => {
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const { toast } = useToast();
  
  // State for availability modal
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [otherAvailability, setOtherAvailability] = useState("");
  
  // Track onboarding journey for analytics
  useJourneyTracking({
    journeyStage: 'profile_creation',
    additionalData: { section: 'next_steps_panel' },
    trackOnce: true
  });

  const [steps, setSteps] = useState([
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
  ]);

  // Load saved progress from Supabase or localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        // Try to load from Supabase if user is logged in
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_progress, availability')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error loading progress:", error);
          // Fall back to localStorage
          loadProgressFromLocalStorage();
          return;
        }
        
        if (data) {
          // Update from database
          updateProgressFromData(data.onboarding_progress, data.availability);
        } else {
          // Fall back to localStorage
          loadProgressFromLocalStorage();
        }
      } catch (err) {
        console.error("Error in loadProgress:", err);
        loadProgressFromLocalStorage();
      }
    };
    
    const loadProgressFromLocalStorage = () => {
      const savedProgress = localStorage.getItem('professionalOnboardingProgress');
      if (savedProgress) {
        try {
          const parsedData = JSON.parse(savedProgress);
          updateProgressFromData(parsedData.steps, parsedData.availability);
        } catch (e) {
          console.error("Error parsing saved progress:", e);
        }
      } else {
        // Set first step completed if user exists (profile creation)
        if (user) {
          const updatedSteps = [...steps];
          updatedSteps[0].completed = true;
          setSteps(updatedSteps);
        }
      }
    };
    
    const updateProgressFromData = (progressData: any, availabilityData: any) => {
      if (progressData) {
        const updatedSteps = [...steps];
        Object.keys(progressData).forEach(stepId => {
          const index = updatedSteps.findIndex(s => s.id === parseInt(stepId));
          if (index >= 0) {
            updatedSteps[index].completed = progressData[stepId];
          }
        });
        setSteps(updatedSteps);
      }
      
      if (availabilityData) {
        setSelectedAvailability(availabilityData);
      }
    };
    
    loadProgress();
  }, [user]);

  // Update progress when steps change
  useEffect(() => {
    const saveProgress = async () => {
      if (!user) return;
      
      const progressData = steps.reduce((acc, step) => {
        acc[step.id] = step.completed;
        return acc;
      }, {} as Record<number, boolean>);
      
      try {
        // Save to Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ 
            onboarding_progress: progressData,
            availability: selectedAvailability
          })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error saving progress:", error);
        }
      } catch (err) {
        console.error("Error in saveProgress:", err);
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('professionalOnboardingProgress', JSON.stringify({
        steps: progressData,
        availability: selectedAvailability
      }));
    };
    
    saveProgress();
  }, [steps, selectedAvailability, user]);

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  // Handle upload certificates action
  const handleUploadCertificates = () => {
    trackEngagement('upload_documents_click', { step: 'certificates' });
    
    toast({
      title: "📩 Submit Your Documents",
      description: (
        <div className="space-y-2">
          <p>Please email or WhatsApp your documents, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Professional certifications</li>
            <li>Valid government-issued ID</li>
            <li>Certificate of Character from the Trinidad & Tobago Police</li>
          </ul>
          <div className="pt-2">
            <a href="mailto:Tavaracare@gmail.com" className="text-primary hover:underline block">
              Email: Tavaracare@gmail.com
            </a>
            <a href="https://wa.me/18687865357" className="text-primary hover:underline block">
              WhatsApp: +1 (868) 786-5357
            </a>
          </div>
        </div>
      ) as any, // Fix: Type assertion to any to resolve Element vs string issue
      duration: 8000,
    });
  };

  // Mark certificates as uploaded
  const markCertificatesUploaded = () => {
    const updatedSteps = [...steps];
    const index = updatedSteps.findIndex(s => s.id === 2);
    if (index >= 0) {
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      trackEngagement('onboarding_step_complete', { 
        step: 'certificates',
        progress_percent: Math.round(((completedSteps + 1) / steps.length) * 100)
      });
      
      toast({
        title: "Step completed",
        description: "Certificates marked as uploaded. Our team will verify your documents.",
        variant: "success",
      });
    }
  };

  // Save availability preferences
  const saveAvailability = async () => {
    if (selectedAvailability.length === 0 && !otherAvailability) {
      toast({
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
    
    // Update step as completed
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

    // Close modal
    setIsAvailabilityModalOpen(false);
    
    toast({
      title: "Availability saved",
      description: "Your availability preferences have been saved.",
      variant: "success",
    });
  };

  // Render the appropriate action button based on step type
  const renderActionButton = (step: typeof steps[0]) => {
    if (step.completed) return null;
    
    switch (step.action) {
      case "upload":
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 text-primary hover:text-primary-600"
              onClick={handleUploadCertificates}
            >
              Upload
              <Upload className="ml-1 h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-6 text-green-600 hover:text-green-700"
              onClick={markCertificatesUploaded}
            >
              Mark Complete
              <CheckCircle2 className="ml-1 h-3 w-3" />
            </Button>
          </div>
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
            <ArrowRight className="ml-1 h-3 w-3" />
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
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <List className="h-5 w-5 text-primary" />
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
                </div>
                {renderActionButton(step)}
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <SubscriptionFeatureLink
              featureType="Task Management" 
              returnPath="/dashboard/professional"
              referringPagePath="/dashboard/professional"
              referringPageLabel="Professional Dashboard"
              className="w-full"
            >
              <span className="flex justify-between items-center w-full">
                <span>View all tasks</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </SubscriptionFeatureLink>
          </div>
        </CardContent>
      </Card>

      {/* Availability Modal */}
      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Availability</DialogTitle>
            <DialogDescription>
              Let clients know when you're available for care shifts.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Standard Weekday Shifts</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekday-standard" 
                      checked={selectedAvailability.includes("Monday - Friday, 8 AM - 4 PM")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Monday - Friday, 8 AM - 4 PM"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Monday - Friday, 8 AM - 4 PM"));
                        }
                      }}
                    />
                    <Label htmlFor="weekday-standard">Monday - Friday, 8 AM - 4 PM (Standard daytime coverage)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekday-extended" 
                      checked={selectedAvailability.includes("Monday - Friday, 6 AM - 6 PM")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Monday - Friday, 6 AM - 6 PM"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Monday - Friday, 6 AM - 6 PM"));
                        }
                      }}
                    />
                    <Label htmlFor="weekday-extended">Monday - Friday, 6 AM - 6 PM (Extended daytime coverage)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekday-night" 
                      checked={selectedAvailability.includes("Monday - Friday, 6 PM - 8 AM")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Monday - Friday, 6 PM - 8 AM"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Monday - Friday, 6 PM - 8 AM"));
                        }
                      }}
                    />
                    <Label htmlFor="weekday-night">Monday - Friday, 6 PM - 8 AM (Nighttime coverage)</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Weekend Shifts</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="weekend-day" 
                      checked={selectedAvailability.includes("Saturday - Sunday, 6 AM - 6 PM")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Saturday - Sunday, 6 AM - 6 PM"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Saturday - Sunday, 6 AM - 6 PM"));
                        }
                      }}
                    />
                    <Label htmlFor="weekend-day">Saturday - Sunday, 6 AM - 6 PM (Daytime weekend coverage)</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Evening Shifts</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="evening-1" 
                      checked={selectedAvailability.includes("Weekday Evening Shift (4 PM - 6 AM)")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Weekday Evening Shift (4 PM - 6 AM)"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Weekday Evening Shift (4 PM - 6 AM)"));
                        }
                      }}
                    />
                    <Label htmlFor="evening-1">Weekday Evening Shift (4 PM - 6 AM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="evening-2" 
                      checked={selectedAvailability.includes("Weekday Evening Shift (4 PM - 8 AM)")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Weekday Evening Shift (4 PM - 8 AM)"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Weekday Evening Shift (4 PM - 8 AM)"));
                        }
                      }}
                    />
                    <Label htmlFor="evening-2">Weekday Evening Shift (4 PM - 8 AM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="evening-3" 
                      checked={selectedAvailability.includes("Weekday Evening Shift (6 PM - 6 AM)")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Weekday Evening Shift (6 PM - 6 AM)"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Weekday Evening Shift (6 PM - 6 AM)"));
                        }
                      }}
                    />
                    <Label htmlFor="evening-3">Weekday Evening Shift (6 PM - 6 AM)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="evening-4" 
                      checked={selectedAvailability.includes("Weekday Evening Shift (6 PM - 8 AM)")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Weekday Evening Shift (6 PM - 8 AM)"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Weekday Evening Shift (6 PM - 8 AM)"));
                        }
                      }}
                    />
                    <Label htmlFor="evening-4">Weekday Evening Shift (6 PM - 8 AM)</Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Other Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="on-demand" 
                      checked={selectedAvailability.includes("On-Demand (As Needed)")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "On-Demand (As Needed)"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "On-Demand (As Needed)"));
                        }
                      }}
                    />
                    <Label htmlFor="on-demand">On-Demand (As Needed)</Label>
                  </div>
                  <div className="space-y-1 pt-2">
                    <Label htmlFor="other-availability">Other (Please specify):</Label>
                    <textarea
                      id="other-availability"
                      value={otherAvailability}
                      onChange={(e) => setOtherAvailability(e.target.value)}
                      className="w-full h-20 px-3 py-2 text-sm border rounded-md"
                      placeholder="Please specify any other availability or special arrangements..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAvailabilityModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAvailability}>
              Save Availability
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
