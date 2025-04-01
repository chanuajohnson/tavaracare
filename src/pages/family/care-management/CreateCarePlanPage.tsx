
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { createCarePlan, fetchCarePlan, updateCarePlan } from "@/services/care-plan-service";
import { toast } from "sonner";

type PlanType = 'scheduled' | 'on-demand' | 'both';
type WeekdayOption = '8am-4pm' | '6am-6pm' | '6pm-8am' | 'none';
type WeekendOption = 'yes' | 'no';

const CreateCarePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { planId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!planId);
  const [isEditMode, setIsEditMode] = useState(!!planId);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [planType, setPlanType] = useState<PlanType>("scheduled");
  const [weekdayOption, setWeekdayOption] = useState<WeekdayOption>("8am-4pm");
  const [weekendOption, setWeekendOption] = useState<WeekendOption>("yes");
  
  // Additional shifts
  const [shifts, setShifts] = useState({
    weekdayEvening4pmTo6am: false,  // 4PM - 6AM
    weekdayEvening4pmTo8am: false,  // 4PM - 8AM
    weekdayEvening6pmTo6am: false,  // 6PM - 6AM
    weekdayEvening6pmTo8am: false,  // 6PM - 8AM (new)
  });

  useEffect(() => {
    if (planId && isEditMode) {
      loadCarePlan();
    }
  }, [planId]);

  const loadCarePlan = async () => {
    try {
      setIsLoading(true);
      const plan = await fetchCarePlan(planId!);
      
      if (plan) {
        setTitle(plan.title);
        setDescription(plan.description || "");
        
        if (plan.metadata) {
          setPlanType(plan.metadata.plan_type || "scheduled");
          setWeekdayOption(plan.metadata.weekday_coverage || "8am-4pm");
          setWeekendOption(plan.metadata.weekend_coverage || "yes");
          
          if (plan.metadata.additional_shifts) {
            setShifts({
              weekdayEvening4pmTo6am: !!plan.metadata.additional_shifts.weekdayEvening4pmTo6am,
              weekdayEvening4pmTo8am: !!plan.metadata.additional_shifts.weekdayEvening4pmTo8am,
              weekdayEvening6pmTo6am: !!plan.metadata.additional_shifts.weekdayEvening6pmTo6am,
              weekdayEvening6pmTo8am: !!plan.metadata.additional_shifts.weekdayEvening6pmTo8am,
            });
          }
        }
      } else {
        toast.error("Care plan not found");
        navigate("/family/care-management");
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      toast.error("Failed to load care plan details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShiftChange = (shift: keyof typeof shifts) => {
    setShifts(prev => ({
      ...prev,
      [shift]: !prev[shift]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a care plan");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please provide a title for your care plan");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare plan details based on selections
      const planDetails = {
        title,
        description,
        family_id: user.id,
        status: 'active' as const,
        metadata: {
          plan_type: planType,
          weekday_coverage: weekdayOption,
          weekend_coverage: weekendOption,
          additional_shifts: shifts
        }
      };
      
      let result;
      if (isEditMode && planId) {
        result = await updateCarePlan(planId, planDetails);
        if (result) {
          toast.success("Care plan updated successfully!");
        }
      } else {
        result = await createCarePlan(planDetails);
        if (result) {
          toast.success("Care plan created successfully!");
        }
      }
      
      if (result) {
        navigate("/family/care-management");
      }
    } catch (error) {
      console.error("Error saving care plan:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} care plan. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/family/care-management")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Management
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{isEditMode ? "Edit Care Plan" : "Create New Care Plan"}</h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? "Update the care plan for your loved one" : "Define a care plan for your loved one with scheduled or on-demand care"}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <p>Loading care plan details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>
                    Provide basic information about this care plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Plan Title</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Mom's Weekly Care Plan" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe the care needs and any special considerations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Plan Type</CardTitle>
                  <CardDescription>
                    Choose how you want to schedule care
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={planType} 
                    onValueChange={(value) => setPlanType(value as PlanType)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="scheduled" id="scheduled" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="scheduled" className="font-medium">
                          Scheduled Care Plan
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Regularly scheduled caregiving shifts following a consistent pattern.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="on-demand" id="on-demand" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="on-demand" className="font-medium">
                          On-Demand Care
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Flexible care shifts as needed without a regular schedule.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="both" className="font-medium">
                          Both (Scheduled + On-Demand)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Regular scheduled care with additional on-demand support as needed.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              {(planType === "scheduled" || planType === "both") && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Primary Weekday Coverage</CardTitle>
                      <CardDescription>
                        Select your preferred weekday caregiver schedule
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup 
                        value={weekdayOption} 
                        onValueChange={(value) => setWeekdayOption(value as WeekdayOption)}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="8am-4pm" id="option1" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option1" className="font-medium">
                              Option 1: Monday - Friday, 8 AM - 4 PM
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Standard daytime coverage during business hours.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="6am-6pm" id="option2" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option2" className="font-medium">
                              Option 2: Monday - Friday, 6 AM - 6 PM
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Extended daytime coverage for more comprehensive care.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="6pm-8am" id="option3" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option3" className="font-medium">
                              Option 3: Monday - Friday, 6 PM - 8 AM
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Extended nighttime coverage to relieve standard daytime coverage.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="none" id="option-none" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option-none" className="font-medium">
                              No Weekday Coverage
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Skip weekday coverage and use on-demand or other shifts.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekend Coverage</CardTitle>
                      <CardDescription>
                        Do you need a primary weekend caregiver?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup 
                        value={weekendOption} 
                        onValueChange={(value) => setWeekendOption(value as WeekendOption)}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="yes" id="weekend-yes" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="weekend-yes" className="font-medium">
                              Yes: Saturday - Sunday, 6 AM - 6 PM
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Daytime weekend coverage with a dedicated caregiver.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="no" id="weekend-no" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="weekend-no" className="font-medium">
                              No Weekend Coverage
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Skip regular weekend coverage.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Shifts</CardTitle>
                      <CardDescription>
                        Select any additional time slots you need covered
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="weekday-evening-4pm-6am"
                            checked={shifts.weekdayEvening4pmTo6am} 
                            onCheckedChange={() => handleShiftChange('weekdayEvening4pmTo6am')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="weekday-evening-4pm-6am" className="font-medium">
                              Weekday Evening Shift (4 PM - 6 AM)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="weekday-evening-4pm-8am"
                            checked={shifts.weekdayEvening4pmTo8am} 
                            onCheckedChange={() => handleShiftChange('weekdayEvening4pmTo8am')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="weekday-evening-4pm-8am" className="font-medium">
                              Weekday Evening Shift (4 PM - 8 AM)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="weekday-evening-6pm-6am"
                            checked={shifts.weekdayEvening6pmTo6am} 
                            onCheckedChange={() => handleShiftChange('weekdayEvening6pmTo6am')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="weekday-evening-6pm-6am" className="font-medium">
                              Weekday Evening Shift (6 PM - 6 AM)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="weekday-evening-6pm-8am"
                            checked={shifts.weekdayEvening6pmTo8am} 
                            onCheckedChange={() => handleShiftChange('weekdayEvening6pmTo8am')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="weekday-evening-6pm-8am" className="font-medium">
                              Weekday Evening Shift (6 PM - 8 AM)
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/family/care-management")}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Care Plan" : "Create Care Plan")}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Container>
    </div>
  );
};

export default CreateCarePlanPage;
