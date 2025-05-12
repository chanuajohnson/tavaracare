
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FamilyCareNeedsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState("daily-care");
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard/family" },
    { label: "Care Needs", path: "/careneeds/family" }
  ];

  // Form state
  const [formData, setFormData] = useState({
    // Daily Care
    assistance_bathing: false,
    assistance_dressing: false,
    assistance_toileting: false,
    assistance_mobility: false,
    assistance_feeding: false,
    assistance_medication: false,
    assistance_oral_care: false,
    assistance_naps: false,
    
    // Household Tasks
    meal_prep: false,
    tidy_room: false,
    grocery_runs: false,
    laundry_support: false,
    
    // Personal Connection
    assistance_companionship: false,
    daily_report_required: false,
    gentle_engagement: false,
    fresh_air_walks: false,
    escort_to_appointments: false,
    
    // Special Care
    fall_monitoring: false,
    vitals_check: false,
    memory_reminders: false,
    dementia_redirection: false,
    wandering_prevention: false,
    equipment_use: false,
    
    // Care Schedule
    plan_type: "scheduled",
    weekday_coverage: "none",
    weekend_coverage: "no",
    weekend_schedule_type: "none",
    preferred_days: [],
    preferred_time_start: "",
    preferred_time_end: "",
    
    // Additional Details
    diagnosed_conditions: "",
    cognitive_notes: "",
    communication_method: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
    additional_notes: "",
  });

  // Load existing care needs data
  useEffect(() => {
    const fetchCareNeeds = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('care_needs_family')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching care needs:", error);
        } else if (data) {
          // Populate form with existing data
          setFormData(prevData => ({
            ...prevData,
            ...Object.fromEntries(
              Object.entries(data).filter(([key]) => key in prevData)
            )
          }));
        }
      } catch (err) {
        console.error("Failed to fetch care needs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCareNeeds();
  }, [user]);

  const handleCheckboxChange = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field]
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save care needs");
      return;
    }
    
    setSaving(true);
    
    try {
      // First try to update existing record
      const { data, error } = await supabase
        .from('care_needs_family')
        .upsert({
          profile_id: user.id,
          ...formData
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update onboarding progress to mark care needs as completed
      await supabase
        .from('profiles')
        .update({
          onboarding_progress: {
            currentStep: 'care_plan',
            completedSteps: {
              care_needs: true
            }
          }
        })
        .eq('id', user.id);
      
      toast.success("Care needs saved successfully!");
      navigate('/dashboard/family');
    } catch (error) {
      console.error("Error saving care needs:", error);
      toast.error("Failed to save care needs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-semibold mb-2">Care Needs Assessment</h1>
            <p className="text-gray-500">
              Help us understand the specific care needs for your loved one.
            </p>
          </div>
          
          <Tabs defaultValue="daily-care" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 max-w-full mb-4">
              <TabsTrigger value="daily-care">Daily Care</TabsTrigger>
              <TabsTrigger value="household">Household</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="special">Special Care</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            
            <Card>
              <TabsContent value="daily-care" className="mt-0">
                <CardHeader>
                  <CardTitle>Daily Care Activities</CardTitle>
                  <CardDescription>
                    Select the daily care activities that your loved one requires assistance with.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_bathing" 
                        checked={formData.assistance_bathing}
                        onCheckedChange={() => handleCheckboxChange('assistance_bathing')}
                      />
                      <Label htmlFor="assistance_bathing">Bathing Assistance</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_dressing" 
                        checked={formData.assistance_dressing}
                        onCheckedChange={() => handleCheckboxChange('assistance_dressing')}
                      />
                      <Label htmlFor="assistance_dressing">Dressing Assistance</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_toileting" 
                        checked={formData.assistance_toileting}
                        onCheckedChange={() => handleCheckboxChange('assistance_toileting')}
                      />
                      <Label htmlFor="assistance_toileting">Toileting Assistance</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_mobility" 
                        checked={formData.assistance_mobility}
                        onCheckedChange={() => handleCheckboxChange('assistance_mobility')}
                      />
                      <Label htmlFor="assistance_mobility">Mobility Assistance</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_feeding" 
                        checked={formData.assistance_feeding}
                        onCheckedChange={() => handleCheckboxChange('assistance_feeding')}
                      />
                      <Label htmlFor="assistance_feeding">Feeding Assistance</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_medication" 
                        checked={formData.assistance_medication}
                        onCheckedChange={() => handleCheckboxChange('assistance_medication')}
                      />
                      <Label htmlFor="assistance_medication">Medication Assistance</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_oral_care" 
                        checked={formData.assistance_oral_care}
                        onCheckedChange={() => handleCheckboxChange('assistance_oral_care')}
                      />
                      <Label htmlFor="assistance_oral_care">Oral Care</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_naps" 
                        checked={formData.assistance_naps}
                        onCheckedChange={() => handleCheckboxChange('assistance_naps')}
                      />
                      <Label htmlFor="assistance_naps">Nap/Rest Supervision</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/dashboard/family')}>
                    Cancel
                  </Button>
                  <Button onClick={() => setCurrentTab('household')}>
                    Next: Household Tasks
                  </Button>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="household" className="mt-0">
                <CardHeader>
                  <CardTitle>Household Tasks</CardTitle>
                  <CardDescription>
                    Select the household tasks that the caregiver should assist with.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="meal_prep" 
                        checked={formData.meal_prep}
                        onCheckedChange={() => handleCheckboxChange('meal_prep')}
                      />
                      <Label htmlFor="meal_prep">Meal Preparation</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tidy_room" 
                        checked={formData.tidy_room}
                        onCheckedChange={() => handleCheckboxChange('tidy_room')}
                      />
                      <Label htmlFor="tidy_room">Light Tidying & Organizing</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="grocery_runs" 
                        checked={formData.grocery_runs}
                        onCheckedChange={() => handleCheckboxChange('grocery_runs')}
                      />
                      <Label htmlFor="grocery_runs">Grocery Shopping</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="laundry_support" 
                        checked={formData.laundry_support}
                        onCheckedChange={() => handleCheckboxChange('laundry_support')}
                      />
                      <Label htmlFor="laundry_support">Laundry Assistance</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentTab('daily-care')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentTab('personal')}>
                    Next: Personal Connection
                  </Button>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="personal" className="mt-0">
                <CardHeader>
                  <CardTitle>Personal Connection</CardTitle>
                  <CardDescription>
                    Select how the caregiver should engage with your loved one.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="assistance_companionship" 
                        checked={formData.assistance_companionship}
                        onCheckedChange={() => handleCheckboxChange('assistance_companionship')}
                      />
                      <Label htmlFor="assistance_companionship">Companionship & Conversation</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="daily_report_required" 
                        checked={formData.daily_report_required}
                        onCheckedChange={() => handleCheckboxChange('daily_report_required')}
                      />
                      <Label htmlFor="daily_report_required">Daily Reports to Family</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="gentle_engagement" 
                        checked={formData.gentle_engagement}
                        onCheckedChange={() => handleCheckboxChange('gentle_engagement')}
                      />
                      <Label htmlFor="gentle_engagement">Gentle Activities & Engagement</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="fresh_air_walks" 
                        checked={formData.fresh_air_walks}
                        onCheckedChange={() => handleCheckboxChange('fresh_air_walks')}
                      />
                      <Label htmlFor="fresh_air_walks">Outdoor Walks</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="escort_to_appointments" 
                        checked={formData.escort_to_appointments}
                        onCheckedChange={() => handleCheckboxChange('escort_to_appointments')}
                      />
                      <Label htmlFor="escort_to_appointments">Appointment Accompaniment</Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentTab('household')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentTab('special')}>
                    Next: Special Care
                  </Button>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="special" className="mt-0">
                <CardHeader>
                  <CardTitle>Special Care Needs</CardTitle>
                  <CardDescription>
                    Select any special care requirements your loved one may need.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="fall_monitoring" 
                        checked={formData.fall_monitoring}
                        onCheckedChange={() => handleCheckboxChange('fall_monitoring')}
                      />
                      <Label htmlFor="fall_monitoring">Fall Prevention & Monitoring</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="vitals_check" 
                        checked={formData.vitals_check}
                        onCheckedChange={() => handleCheckboxChange('vitals_check')}
                      />
                      <Label htmlFor="vitals_check">Vital Signs Monitoring</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="memory_reminders" 
                        checked={formData.memory_reminders}
                        onCheckedChange={() => handleCheckboxChange('memory_reminders')}
                      />
                      <Label htmlFor="memory_reminders">Memory Prompts & Reminders</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="dementia_redirection" 
                        checked={formData.dementia_redirection}
                        onCheckedChange={() => handleCheckboxChange('dementia_redirection')}
                      />
                      <Label htmlFor="dementia_redirection">Dementia Redirection Techniques</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="wandering_prevention" 
                        checked={formData.wandering_prevention}
                        onCheckedChange={() => handleCheckboxChange('wandering_prevention')}
                      />
                      <Label htmlFor="wandering_prevention">Wandering Prevention</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="equipment_use" 
                        checked={formData.equipment_use}
                        onCheckedChange={() => handleCheckboxChange('equipment_use')}
                      />
                      <Label htmlFor="equipment_use">Medical Equipment Management</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="diagnosed_conditions">Diagnosed Medical Conditions (if any)</Label>
                    <Input 
                      id="diagnosed_conditions" 
                      value={formData.diagnosed_conditions || ''}
                      onChange={(e) => handleInputChange('diagnosed_conditions', e.target.value)}
                      placeholder="e.g., Dementia, Diabetes, High Blood Pressure"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cognitive_notes">Cognitive/Memory Status Notes</Label>
                    <Textarea 
                      id="cognitive_notes" 
                      value={formData.cognitive_notes || ''}
                      onChange={(e) => handleInputChange('cognitive_notes', e.target.value)}
                      placeholder="Please describe memory issues, communication preferences, etc."
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentTab('personal')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentTab('schedule')}>
                    Next: Care Schedule
                  </Button>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="schedule" className="mt-0">
                <CardHeader>
                  <CardTitle>Care Schedule</CardTitle>
                  <CardDescription>
                    Define when you need care support for your loved one.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Care Plan Type</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="scheduled" 
                          name="plan_type"
                          checked={formData.plan_type === "scheduled"}
                          onChange={() => handleInputChange('plan_type', 'scheduled')}
                        />
                        <Label htmlFor="scheduled">Scheduled (Regular weekly schedule)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="on-demand" 
                          name="plan_type"
                          checked={formData.plan_type === "on-demand"}
                          onChange={() => handleInputChange('plan_type', 'on-demand')}
                        />
                        <Label htmlFor="on-demand">On-Demand (As needed care)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="both" 
                          name="plan_type"
                          checked={formData.plan_type === "both"}
                          onChange={() => handleInputChange('plan_type', 'both')}
                        />
                        <Label htmlFor="both">Both (Regular schedule with additional on-call)</Label>
                      </div>
                    </div>
                  </div>
                  
                  {formData.plan_type !== "on-demand" && (
                    <>
                      <div className="space-y-3">
                        <Label>Weekday Coverage</Label>
                        <Select 
                          value={formData.weekday_coverage}
                          onValueChange={(value) => handleInputChange('weekday_coverage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select weekday coverage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No weekday coverage needed</SelectItem>
                            <SelectItem value="8am-4pm">8am - 4pm (Standard day)</SelectItem>
                            <SelectItem value="6am-6pm">6am - 6pm (Extended day)</SelectItem>
                            <SelectItem value="6pm-8am">6pm - 8am (Overnight)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Weekend Coverage</Label>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="weekend-yes" 
                              name="weekend_coverage"
                              checked={formData.weekend_coverage === "yes"}
                              onChange={() => handleInputChange('weekend_coverage', 'yes')}
                            />
                            <Label htmlFor="weekend-yes">Yes, weekend care needed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="weekend-no" 
                              name="weekend_coverage"
                              checked={formData.weekend_coverage === "no"}
                              onChange={() => handleInputChange('weekend_coverage', 'no')}
                            />
                            <Label htmlFor="weekend-no">No weekend care needed</Label>
                          </div>
                        </div>
                      </div>
                      
                      {formData.weekend_coverage === "yes" && (
                        <div className="space-y-3">
                          <Label>Weekend Schedule</Label>
                          <Select 
                            value={formData.weekend_schedule_type}
                            onValueChange={(value) => handleInputChange('weekend_schedule_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select weekend schedule" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6am-6pm">6am - 6pm (Full day)</SelectItem>
                              <SelectItem value="8am-4pm">8am - 4pm (Standard day)</SelectItem>
                              <SelectItem value="6pm-8am">6pm - 8am (Overnight)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="communication_method">Preferred Communication Method</Label>
                    <Select 
                      value={formData.communication_method || ''}
                      onValueChange={(value) => handleInputChange('communication_method', value)}
                    >
                      <SelectTrigger id="communication_method">
                        <SelectValue placeholder="Select preferred method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="app">In-App Communication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Emergency Contact Information</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="emergency_contact_name" className="text-sm">Name</Label>
                        <Input 
                          id="emergency_contact_name" 
                          value={formData.emergency_contact_name || ''}
                          onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="emergency_contact_relationship" className="text-sm">Relationship</Label>
                        <Input 
                          id="emergency_contact_relationship" 
                          value={formData.emergency_contact_relationship || ''}
                          onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                          placeholder="Relationship to care recipient"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="emergency_contact_phone" className="text-sm">Phone</Label>
                        <Input 
                          id="emergency_contact_phone" 
                          type="tel" 
                          value={formData.emergency_contact_phone || ''}
                          onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                          placeholder="Emergency contact phone number"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additional_notes">Additional Notes or Instructions</Label>
                    <Textarea 
                      id="additional_notes" 
                      value={formData.additional_notes || ''}
                      onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                      placeholder="Any additional care instructions or preferences"
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentTab('special')}>
                    Back
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Care Needs"}
                  </Button>
                </CardFooter>
              </TabsContent>
            </Card>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyCareNeedsPage;
