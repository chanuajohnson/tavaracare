
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, List, ArrowRight, Upload, Clock } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, Sun, Moon, Home, Clock as ClockIcon } from "lucide-react";

export const NextStepsPanel = () => {
  const { user } = useAuth();
  const { trackEngagement } = useTracking();
  const { toast } = useToast();
  
  // State for availability modal
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [otherAvailability, setOtherAvailability] = useState("");
  const [loading, setLoading] = useState(false);
  
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

  // Load saved progress from localStorage and eventually sync with database when column exists
  useEffect(() => {
    const loadProgress = () => {
      try {
        // Set first step completed if user exists (profile creation)
        if (user) {
          const updatedSteps = [...steps];
          updatedSteps[0].completed = true;
          setSteps(updatedSteps);
        }
        
        // Load progress from localStorage
        const savedProgress = localStorage.getItem('professionalOnboardingProgress');
        if (savedProgress) {
          try {
            const parsedData = JSON.parse(savedProgress);
            
            // Update steps from localStorage
            if (parsedData.steps) {
              const updatedSteps = [...steps];
              Object.keys(parsedData.steps).forEach(stepId => {
                const index = updatedSteps.findIndex(s => s.id === parseInt(stepId));
                if (index >= 0) {
                  updatedSteps[index].completed = parsedData.steps[stepId];
                }
              });
              setSteps(updatedSteps);
            }
            
            // Update availability from localStorage
            if (parsedData.availability) {
              setSelectedAvailability(Array.isArray(parsedData.availability) ? parsedData.availability : []);
            }
          } catch (e) {
            console.error("Error parsing saved progress:", e);
          }
        }
      } catch (err) {
        console.error("Error in loadProgress:", err);
      }
    };
    
    loadProgress();
  }, [user]);

  // Update progress in localStorage when steps change
  useEffect(() => {
    const saveProgress = () => {
      try {
        const progressData = steps.reduce((acc, step) => {
          acc[step.id] = step.completed;
          return acc;
        }, {} as Record<number, boolean>);
        
        localStorage.setItem('professionalOnboardingProgress', JSON.stringify({
          steps: progressData,
          availability: selectedAvailability
        }));
        
        // We'll attempt to save to the database only when we're sure the column exists
        // This is handled separately in a production environment
      } catch (err) {
        console.error("Error in saveProgress:", err);
      }
    };
    
    saveProgress();
  }, [steps, selectedAvailability]);

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  // Handle upload certificates action
  const handleUploadCertificates = () => {
    trackEngagement('upload_documents_click', { step: 'certificates' });
    
    // Auto-mark as completed after showing the upload instructions
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
            <a href="mailto:Tavaracare@gmail.com" className="text-primary hover:underline block">
              Email: Tavaracare@gmail.com
            </a>
            <a href="https://wa.me/18687865357" className="text-primary hover:underline block">
              WhatsApp: +1 (868) 786-5357
            </a>
          </div>
        </div>
      ),
      duration: 8000,
    });
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
    });
  };

  // Render the appropriate action button based on step type
  const renderActionButton = (step: typeof steps[0]) => {
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

  // Define the availability options
  // Fixed: Changed to ensure each option has a string value property
  const availabilityOptions = [
    {
      id: "standard-weekday",
      label: "Monday – Friday, 8 AM – 4 PM",
      description: "Standard daytime coverage",
      icon: <Sun className="h-4 w-4 mr-2 text-amber-400" />,
      value: "Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)"
    },
    {
      id: "extended-weekday",
      label: "Monday – Friday, 6 AM – 6 PM",
      description: "Extended daytime coverage",
      icon: <Sun className="h-4 w-4 mr-2 text-amber-500" />,
      value: "Monday – Friday, 6 AM – 6 PM (Extended daytime coverage)"
    },
    {
      id: "weekday-night",
      label: "Monday – Friday, 6 PM – 8 AM",
      description: "Nighttime coverage",
      icon: <Moon className="h-4 w-4 mr-2 text-indigo-400" />,
      value: "Monday – Friday, 6 PM – 8 AM (Nighttime coverage)"
    },
    {
      id: "weekend-day",
      label: "Saturday – Sunday, 6 AM – 6 PM",
      description: "Daytime weekend coverage",
      icon: <Calendar className="h-4 w-4 mr-2 text-green-500" />,
      value: "Saturday – Sunday, 6 AM – 6 PM (Daytime weekend coverage)"
    },
    {
      id: "evening-shift-1",
      label: "Weekday Evening Shift (4 PM – 6 AM)",
      description: "",
      icon: <Moon className="h-4 w-4 mr-2 text-purple-400" />,
      value: "Weekday Evening Shift (4 PM – 6 AM)"
    },
    {
      id: "evening-shift-2",
      label: "Weekday Evening Shift (4 PM – 8 AM)",
      description: "",
      icon: <Moon className="h-4 w-4 mr-2 text-purple-500" />,
      value: "Weekday Evening Shift (4 PM – 8 AM)"
    },
    {
      id: "evening-shift-3",
      label: "Weekday Evening Shift (6 PM – 6 AM)",
      description: "",
      icon: <Moon className="h-4 w-4 mr-2 text-purple-600" />,
      value: "Weekday Evening Shift (6 PM – 6 AM)"
    },
    {
      id: "evening-shift-4",
      label: "Weekday Evening Shift (6 PM – 8 AM)",
      description: "",
      icon: <Moon className="h-4 w-4 mr-2 text-purple-700" />,
      value: "Weekday Evening Shift (6 PM – 8 AM)"
    },
    {
      id: "flexible",
      label: "Flexible / On-Demand Availability",
      description: "",
      icon: <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />,
      value: "Flexible / On-Demand Availability"
    },
    {
      id: "live-in",
      label: "Live-In Care",
      description: "Full-time in-home support",
      icon: <Home className="h-4 w-4 mr-2 text-green-600" />,
      value: "Live-In Care (Full-time in-home support)"
    }
  ];

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
                <div className="flex-shrink-0">
                  {renderActionButton(step)}
                </div>
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

      {/* Availability Modal - Updated to match the new format */}
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
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" /> 
                  Select your available shifts
                </h3>
                
                {/* Standard Weekday Shifts */}
                <div className="mb-4">
                  <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">🗓️ Standard Weekday Shifts</h4>
                  <div className="space-y-2">
                    {availabilityOptions.slice(0, 3).map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option.id} 
                          checked={selectedAvailability.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAvailability([...selectedAvailability, option.value]);
                            } else {
                              setSelectedAvailability(selectedAvailability.filter(a => a !== option.value));
                            }
                          }}
                        />
                        <Label htmlFor={option.id} className="flex items-center">
                          {option.icon}
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 ml-1">({option.description})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Weekend Shifts */}
                <div className="mb-4">
                  <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">📅 Weekend Shifts</h4>
                  <div className="space-y-2">
                    {availabilityOptions.slice(3, 4).map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option.id} 
                          checked={selectedAvailability.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAvailability([...selectedAvailability, option.value]);
                            } else {
                              setSelectedAvailability(selectedAvailability.filter(a => a !== option.value));
                            }
                          }}
                        />
                        <Label htmlFor={option.id} className="flex items-center">
                          {option.icon}
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 ml-1">({option.description})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Evening & Overnight Shifts */}
                <div className="mb-4">
                  <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">🌆 Evening & Overnight Shifts</h4>
                  <div className="space-y-2">
                    {availabilityOptions.slice(4, 8).map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option.id} 
                          checked={selectedAvailability.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAvailability([...selectedAvailability, option.value]);
                            } else {
                              setSelectedAvailability(selectedAvailability.filter(a => a !== option.value));
                            }
                          }}
                        />
                        <Label htmlFor={option.id} className="flex items-center">
                          {option.icon}
                          <span>{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Other Options */}
                <div className="mb-4">
                  <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">🔄 Other Options</h4>
                  <div className="space-y-2">
                    {availabilityOptions.slice(8, 10).map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option.id} 
                          checked={selectedAvailability.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAvailability([...selectedAvailability, option.value]);
                            } else {
                              setSelectedAvailability(selectedAvailability.filter(a => a !== option.value));
                            }
                          }}
                        />
                        <Label htmlFor={option.id} className="flex items-center">
                          {option.icon}
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 ml-1">({option.description})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Shift Option */}
                <div className="space-y-1 pt-2">
                  <Label htmlFor="other-availability" className="flex items-center mb-1">
                    <span className="mr-2">✏️</span> Other (Custom shift — specify your hours):
                  </Label>
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
