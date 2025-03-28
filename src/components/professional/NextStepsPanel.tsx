import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Upload, Clock, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useTracking } from "@/hooks/useTracking";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, Sun, Moon, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export const NextStepsPanel = () => {
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const { toast } = useToast();
  
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [otherAvailability, setOtherAvailability] = useState("");

  const [steps, setSteps] = useState(initialSteps);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'local' | 'database' | 'none'>('none');

  useJourneyTracking({
    journeyStage: 'profile_creation',
    additionalData: { section: 'next_steps_panel' },
    trackOnce: true
  });

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      
      try {
        const localDataLoaded = loadProgressFromLocalStorage();
        if (localDataLoaded) {
          setDataSource('local');
        }
        
        if (user && navigator.onLine) {
          const databaseDataLoaded = await loadProgressFromDatabase();
          if (databaseDataLoaded) {
            setDataSource('database');
          }
        }
        
        if (dataSource === 'none' && user) {
          const updatedSteps = [...initialSteps];
          updatedSteps[0].completed = true;
          setSteps(updatedSteps);
          saveProgressToLocalStorage(updatedSteps, []);
        }
      } catch (err) {
        console.error("Error loading progress:", err);
        setError("Failed to load progress. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, [user]);

  const loadProgressFromLocalStorage = () => {
    try {
      const savedProgress = localStorage.getItem('professionalOnboardingProgress');
      if (savedProgress) {
        const parsedData = JSON.parse(savedProgress);
        
        if (parsedData.steps) {
          const updatedSteps = [...initialSteps];
          Object.keys(parsedData.steps).forEach(stepId => {
            const index = updatedSteps.findIndex(s => s.id === parseInt(stepId));
            if (index >= 0) {
              updatedSteps[index].completed = parsedData.steps[stepId];
            }
          });
          setSteps(updatedSteps);
        }
        
        if (parsedData.availability) {
          setSelectedAvailability(Array.isArray(parsedData.availability) ? parsedData.availability : []);
        }
        
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error parsing saved local progress:", e);
      return false;
    }
  };

  const loadProgressFromDatabase = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_progress, availability')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Supabase error loading progress:", error);
        return false;
      }
      
      if (!data) {
        return false;
      }
      
      if (data.onboarding_progress) {
        const updatedSteps = [...initialSteps];
        Object.keys(data.onboarding_progress).forEach(stepId => {
          const index = updatedSteps.findIndex(s => s.id === parseInt(stepId));
          if (index >= 0) {
            updatedSteps[index].completed = data.onboarding_progress[stepId];
          }
        });
        setSteps(updatedSteps);
      }
      
      if (data.availability) {
        setSelectedAvailability(Array.isArray(data.availability) ? data.availability : []);
      }
      
      return true;
    } catch (err) {
      console.error("Error loading from database:", err);
      return false;
    }
  };

  const saveProgressToLocalStorage = (currentSteps: typeof initialSteps, availability: string[]) => {
    try {
      const progressData = currentSteps.reduce((acc, step) => {
        acc[step.id] = step.completed;
        return acc;
      }, {} as Record<number, boolean>);
      
      localStorage.setItem('professionalOnboardingProgress', JSON.stringify({
        steps: progressData,
        availability: availability || selectedAvailability
      }));
      
      return true;
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      return false;
    }
  };

  const saveProgressToDatabase = async (currentSteps: typeof initialSteps, availability: string[]) => {
    if (!user || !navigator.onLine) return false;
    
    try {
      const progressData = currentSteps.reduce((acc, step) => {
        acc[step.id] = step.completed;
        return acc;
      }, {} as Record<number, boolean>);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_progress: progressData,
          availability: availability || selectedAvailability
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Supabase error saving progress:", error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error saving to database:", err);
      return false;
    }
  };

  useEffect(() => {
    if (loading) return;
    
    const saveProgress = async () => {
      saveProgressToLocalStorage(steps, selectedAvailability);
      
      if (user && navigator.onLine) {
        saveProgressToDatabase(steps, selectedAvailability);
      }
    };
    
    saveProgress();
  }, [steps, selectedAvailability, loading]);

  const handleUploadCertificates = () => {
    trackEngagement('upload_documents_click', { step: 'certificates' });
    
    const updatedSteps = [...steps];
    const index = updatedSteps.findIndex(s => s.id === 2);
    if (index >= 0 && !updatedSteps[index].completed) {
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      trackEngagement('onboarding_step_complete', { 
        step: 'certificates',
        progress_percent: Math.round(((completedSteps + 1) / steps.length) * 100)
      });
    }
    
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
            <a href="mailto:chanuajohnson@gmail.com" className="text-primary hover:underline block">
              Email: chanuajohnson@gmail.com
            </a>
            <a href="https://wa.me/18687865357" className="text-primary hover:underline block">
              WhatsApp: +1 (868) 786-5357
            </a>
          </div>
        </div>
      ) as any,
      duration: 8000,
    });
  };

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
    
    saveProgressToLocalStorage(updatedSteps, finalAvailability);
    
    if (user && navigator.onLine) {
      await saveProgressToDatabase(updatedSteps, finalAvailability);
    }
    
    toast({
      title: "Availability saved",
      description: "Your availability preferences have been saved.",
      variant: "success",
    });
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
            <Upload className="ml-1 h-3 w-3" />
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
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        );
      
      case "orientation":
        return null;
      
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <List className="h-5 w-5 text-primary" />
              Next Steps
            </CardTitle>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[150px]" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-2 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <List className="h-5 w-5 text-red-500" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
          
          <div className="space-y-4 mt-4">
            <Link to="/professional/profile">
              <Button variant="default" className="w-full">
                View all tasks
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Availability</DialogTitle>
            <DialogDescription>
              Let clients know when you're available for care shifts.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" /> Standard Weekday Shifts
                </h3>
                <div className="space-y-3">
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
                    <Label htmlFor="weekday-standard" className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-amber-400" /> Monday - Friday, 8 AM - 4 PM (Standard daytime coverage)
                    </Label>
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
                    <Label htmlFor="weekday-extended" className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-amber-400" /> Monday - Friday, 6 AM - 6 PM (Extended daytime coverage)
                    </Label>
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
                    <Label htmlFor="weekday-night" className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-indigo-400" /> Monday - Friday, 6 PM - 8 AM (Nighttime coverage)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" /> Weekend Shifts
                </h3>
                <div className="space-y-3">
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
                    <Label htmlFor="weekend-day" className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-amber-400" /> Saturday - Sunday, 6 AM - 6 PM (Daytime weekend coverage)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" /> Evening & Overnight Shifts
                </h3>
                <div className="space-y-3">
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
                    <Label htmlFor="evening-1" className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-indigo-400" /> Weekday Evening Shift (4 PM - 6 AM)
                    </Label>
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
                    <Label htmlFor="evening-2" className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-indigo-400" /> Weekday Evening Shift (4 PM - 8 AM)
                    </Label>
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
                    <Label htmlFor="evening-3" className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-indigo-400" /> Weekday Evening Shift (6 PM - 6 AM)
                    </Label>
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
                    <Label htmlFor="evening-4" className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-indigo-400" /> Weekday Evening Shift (6 PM - 8 AM)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" /> Other Options
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="on-demand" 
                      checked={selectedAvailability.includes("Flexible / On-Demand Availability")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Flexible / On-Demand Availability"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Flexible / On-Demand Availability"));
                        }
                      }}
                    />
                    <Label htmlFor="on-demand" className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-600" /> Flexible / On-Demand Availability
                    </Label>
                  </div>
                  <div className="space-y-1 pt-2">
                    <Label htmlFor="other-availability" className="flex items-center mb-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-600" /> Other (Custom shift — specify your hours):
                    </Label>
                    <textarea
                      id="other-availability"
                      value={otherAvailability}
                      onChange={(e) => setOtherAvailability(e.target.value)}
                      className="w-full h-20 px-3 py-2 text-sm border rounded-md"
                      placeholder="Please specify any other availability or special arrangements..."
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox 
                      id="live-in" 
                      checked={selectedAvailability.includes("Live-In Care (Full-time in-home support)")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAvailability([...selectedAvailability, "Live-In Care (Full-time in-home support)"]);
                        } else {
                          setSelectedAvailability(selectedAvailability.filter(a => a !== "Live-In Care (Full-time in-home support)"));
                        }
                      }}
                    />
                    <Label htmlFor="live-in" className="flex items-center">
                      <Home className="h-4 w-4 mr-2 text-green-600" /> Live-In Care (Full-time in-home support)
                    </Label>
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
