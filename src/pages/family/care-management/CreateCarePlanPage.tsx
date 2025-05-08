import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createCarePlan, fetchCarePlanById, updateCarePlan } from "@/services/care-plans";
import { toast } from "sonner";
import { CarePlanMetadata } from '@/types/carePlan';
import { generateTimeOptions, formatTime } from '@/services/care-plans/shiftGenerationService';

type PlanType = 'scheduled' | 'on-demand' | 'both';
type WeekdayOption = '8am-4pm' | '8am-6pm' | '6am-6pm' | '6pm-8am' | 'none';
type WeekendOption = 'yes' | 'no';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface CustomShift {
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
  title?: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CreateCarePlanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isEditMode] = useState(!!id);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [planType, setPlanType] = useState<PlanType>("scheduled");
  const [weekdayOption, setWeekdayOption] = useState<WeekdayOption>("8am-4pm");
  const [weekendOption, setWeekendOption] = useState<WeekendOption>("yes");
  
  const [shifts, setShifts] = useState({
    weekdayEvening4pmTo6am: false,
    weekdayEvening4pmTo8am: false,
    weekdayEvening6pmTo6am: false,
    weekdayEvening6pmTo8am: false,
    weekday8amTo4pm: false,
    weekday8amTo6pm: false,
  });

  // Custom shifts state
  const [customShifts, setCustomShifts] = useState<CustomShift[]>([]);
  const [newCustomShift, setNewCustomShift] = useState<CustomShift>({
    days: [],
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    if (id) {
      loadCarePlan();
    }
  }, [id]);

  const loadCarePlan = async () => {
    try {
      setIsLoading(true);
      const plan = await fetchCarePlanById(id!);
      
      if (plan) {
        setTitle(plan.title);
        setDescription(plan.description || "");
        
        if (plan.metadata) {
          setPlanType(plan.metadata.planType || "scheduled");
          setWeekdayOption(plan.metadata.weekdayCoverage || "8am-4pm");
          setWeekendOption(plan.metadata.weekendCoverage || "yes");
          
          if (plan.metadata.additionalShifts) {
            setShifts({
              weekdayEvening4pmTo6am: !!plan.metadata.additionalShifts.weekdayEvening4pmTo6am,
              weekdayEvening4pmTo8am: !!plan.metadata.additionalShifts.weekdayEvening4pmTo8am,
              weekdayEvening6pmTo6am: !!plan.metadata.additionalShifts.weekdayEvening6pmTo6am,
              weekdayEvening6pmTo8am: !!plan.metadata.additionalShifts.weekdayEvening6pmTo8am,
              weekday8amTo4pm: !!plan.metadata.additionalShifts.weekday8amTo4pm,
              weekday8amTo6pm: !!plan.metadata.additionalShifts.weekday8amTo6pm,
            });
          }
          
          if (plan.metadata.customShifts && plan.metadata.customShifts.length > 0) {
            setCustomShifts(plan.metadata.customShifts);
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

  // Custom shift handlers
  const handleCustomShiftDayChange = (day: DayOfWeek, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setNewCustomShift(prev => ({
        ...prev,
        days: [...prev.days, day]
      }));
    } else {
      setNewCustomShift(prev => ({
        ...prev,
        days: prev.days.filter(d => d !== day)
      }));
    }
  };

  const addCustomShift = () => {
    if (newCustomShift.days.length > 0 && newCustomShift.startTime && newCustomShift.endTime) {
      setCustomShifts(prev => [...prev, { ...newCustomShift }]);
      // Reset the form
      setNewCustomShift({
        days: [],
        startTime: '',
        endTime: ''
      });
    } else {
      toast.error("Please select at least one day and both start and end times");
    }
  };

  const removeCustomShift = (index: number) => {
    setCustomShifts(prev => prev.filter((_, i) => i !== index));
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
      
      const planDetails = {
        title,
        description,
        familyId: user.id,
        status: 'active' as const,
        metadata: {
          planType,
          weekdayCoverage: weekdayOption,
          weekendCoverage: weekendOption,
          additionalShifts: shifts,
          customShifts: customShifts.length > 0 ? customShifts : undefined
        }
      };
      
      let result;
      if (isEditMode && id) {
        result = await updateCarePlan(id, planDetails);
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
          onClick={() => navigate(id ? `/family/care-management/${id}` : "/family/care-management")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {id ? "Back to Care Plan Details" : "Back to Care Management"}
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{isEditMode ? "Edit Care Plan" : "Create New Care Plan"}</h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? "Update the care plan for your loved one" : "Define a care plan for your loved one"}
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
                          <RadioGroupItem value="8am-6pm" id="option2" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option2" className="font-medium">
                              Option 2: Monday - Friday, 8 AM - 6 PM
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Extended daytime coverage with later end time.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="6am-6pm" id="option3" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option3" className="font-medium">
                              Option 3: Monday - Friday, 6 AM - 6 PM
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Extended daytime coverage for more comprehensive care.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="6pm-8am" id="option4" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="option4" className="font-medium">
                              Option 4: Monday - Friday, 6 PM - 8 AM
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
                        {weekdayOption === '8am-6pm' && (
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id="weekday-8am-4pm"
                              checked={shifts.weekday8amTo4pm} 
                              onCheckedChange={() => handleShiftChange('weekday8amTo4pm')}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="weekday-8am-4pm" className="font-medium">
                                Monday - Friday, 8 AM - 4 PM
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Standard daytime coverage during business hours.
                              </p>
                            </div>
                          </div>
                        )}

                        {weekdayOption === '8am-4pm' && (
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id="weekday-8am-6pm"
                              checked={shifts.weekday8amTo6pm} 
                              onCheckedChange={() => handleShiftChange('weekday8amTo6pm')}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="weekday-8am-6pm" className="font-medium">
                                Monday - Friday, 8 AM - 6 PM
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Extended daytime coverage with later end time.
                              </p>
                            </div>
                          </div>
                        )}

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
              
              {/* Custom Shifts Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Shifts</CardTitle>
                  <CardDescription>
                    Define your own custom recurring shifts with specific days and times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Display existing custom shifts */}
                  {customShifts.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h4 className="font-medium">Your Custom Shifts</h4>
                      {customShifts.map((shift, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <span className="font-medium">
                              {shift.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCustomShift(index)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Form to add a new custom shift */}
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-4">Add New Custom Shift</h4>
                    
                    <div className="space-y-4">
                      {/* Day selection */}
                      <div>
                        <Label className="mb-2 block">Select Days</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {DAYS_OF_WEEK.map((day, index) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day}`}
                                checked={newCustomShift.days.includes(day)}
                                onCheckedChange={(checked) => handleCustomShiftDayChange(day, checked)}
                              />
                              <Label htmlFor={`day-${day}`} className="capitalize font-normal">
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Select 
                            value={newCustomShift.startTime} 
                            onValueChange={(value) => setNewCustomShift(prev => ({ ...prev, startTime: value }))}
                          >
                            <SelectTrigger id="start-time">
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {generateTimeOptions().map((time) => (
                                <SelectItem key={`start-${time}`} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Select 
                            value={newCustomShift.endTime} 
                            onValueChange={(value) => setNewCustomShift(prev => ({ ...prev, endTime: value }))}
                          >
                            <SelectTrigger id="end-time">
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {generateTimeOptions().map((time) => (
                                <SelectItem key={`end-${time}`} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        disabled={newCustomShift.days.length === 0 || !newCustomShift.startTime || !newCustomShift.endTime}
                        onClick={addCustomShift}
                        className="w-full md:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Shift
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(id ? `/family/care-management/${id}` : "/family/care-management")}
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
