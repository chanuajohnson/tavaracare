
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Clock, User, Phone, Heart, AlertCircle, Calendar } from "lucide-react";

interface CareNeedsFormData {
  // Personal care assistance
  assistance_bathing: boolean;
  assistance_dressing: boolean;
  assistance_toileting: boolean;
  assistance_oral_care: boolean;
  assistance_feeding: boolean;
  assistance_mobility: boolean;
  assistance_medication: boolean;
  assistance_companionship: boolean;
  
  // Health monitoring
  vitals_check: boolean;
  fall_monitoring: boolean;
  equipment_use: boolean;
  
  // Memory care
  memory_reminders: boolean;
  dementia_redirection: boolean;
  wandering_prevention: boolean;
  gentle_engagement: boolean;
  assistance_naps: boolean;
  
  // Household support
  meal_prep: boolean;
  tidy_room: boolean;
  laundry_support: boolean;
  grocery_runs: boolean;
  
  // Mobility and activities
  fresh_air_walks: boolean;
  escort_to_appointments: boolean;
  
  // Schedule and preferences
  plan_type: string;
  weekday_coverage: string;
  weekend_coverage: string;
  weekend_schedule_type: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  preferred_days: string[];
  
  // Communication and emergency
  communication_method: string;
  daily_report_required: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Medical information
  diagnosed_conditions: string;
  cognitive_notes: string;
  additional_notes: string;
}

const initialFormData: CareNeedsFormData = {
  assistance_bathing: false,
  assistance_dressing: false,
  assistance_toileting: false,
  assistance_oral_care: false,
  assistance_feeding: false,
  assistance_mobility: false,
  assistance_medication: false,
  assistance_companionship: false,
  vitals_check: false,
  fall_monitoring: false,
  equipment_use: false,
  memory_reminders: false,
  dementia_redirection: false,
  wandering_prevention: false,
  gentle_engagement: false,
  assistance_naps: false,
  meal_prep: false,
  tidy_room: false,
  laundry_support: false,
  grocery_runs: false,
  fresh_air_walks: false,
  escort_to_appointments: false,
  plan_type: "scheduled",
  weekday_coverage: "8am-4pm",
  weekend_coverage: "no",
  weekend_schedule_type: "none",
  preferred_days: [],
  communication_method: "phone",
  daily_report_required: false,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  diagnosed_conditions: "",
  cognitive_notes: "",
  additional_notes: ""
};

export const CareNeedsAssessmentForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CareNeedsFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState(false);

  useEffect(() => {
    if (user) {
      loadExistingAssessment();
    }
  }, [user]);

  const loadExistingAssessment = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('care_needs_family')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading assessment:", error);
        return;
      }

      if (data) {
        setExistingAssessment(true);
        setFormData({
          ...initialFormData,
          ...data,
          preferred_days: data.preferred_days || [],
          preferred_time_start: data.preferred_time_start || "",
          preferred_time_end: data.preferred_time_end || ""
        });
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);

      const assessmentData = {
        ...formData,
        profile_id: user.id,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingAssessment) {
        const { error: updateError } = await supabase
          .from('care_needs_family')
          .update(assessmentData)
          .eq('profile_id', user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('care_needs_family')
          .insert(assessmentData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast.success(existingAssessment ? "Assessment updated successfully!" : "Assessment completed successfully!");
      
      // Refresh the page to update next steps
      window.location.href = "/dashboard/family";
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              {existingAssessment ? "Update Care Needs Assessment" : "Care Needs Assessment"}
            </h1>
            <p className="text-lg text-gray-600">
              Help us understand your loved one's care needs to provide the best possible support.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Care Assistance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Care Assistance
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'assistance_bathing', label: 'Bathing assistance' },
                  { key: 'assistance_dressing', label: 'Dressing assistance' },
                  { key: 'assistance_toileting', label: 'Toileting assistance' },
                  { key: 'assistance_oral_care', label: 'Oral care assistance' },
                  { key: 'assistance_feeding', label: 'Feeding assistance' },
                  { key: 'assistance_mobility', label: 'Mobility assistance' },
                  { key: 'assistance_medication', label: 'Medication assistance' },
                  { key: 'assistance_companionship', label: 'Companionship' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                      onCheckedChange={(checked) => updateFormData(item.key, checked)}
                    />
                    <Label htmlFor={item.key}>{item.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Health Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Health Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'vitals_check', label: 'Vital signs monitoring' },
                  { key: 'fall_monitoring', label: 'Fall risk monitoring' },
                  { key: 'equipment_use', label: 'Medical equipment assistance' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                      onCheckedChange={(checked) => updateFormData(item.key, checked)}
                    />
                    <Label htmlFor={item.key}>{item.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Memory Care */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Memory Care & Cognitive Support
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'memory_reminders', label: 'Memory reminders' },
                  { key: 'dementia_redirection', label: 'Dementia redirection techniques' },
                  { key: 'wandering_prevention', label: 'Wandering prevention' },
                  { key: 'gentle_engagement', label: 'Gentle engagement activities' },
                  { key: 'assistance_naps', label: 'Rest and nap assistance' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                      onCheckedChange={(checked) => updateFormData(item.key, checked)}
                    />
                    <Label htmlFor={item.key}>{item.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Household Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Household Support
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'meal_prep', label: 'Meal preparation' },
                  { key: 'tidy_room', label: 'Light housekeeping' },
                  { key: 'laundry_support', label: 'Laundry assistance' },
                  { key: 'grocery_runs', label: 'Grocery shopping' },
                  { key: 'fresh_air_walks', label: 'Outdoor walks' },
                  { key: 'escort_to_appointments', label: 'Appointment transportation' }
                ].map(item => (
                  <div key={item.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.key}
                      checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                      onCheckedChange={(checked) => updateFormData(item.key, checked)}
                    />
                    <Label htmlFor={item.key}>{item.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Schedule Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Care Schedule Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan_type">Care Plan Type</Label>
                    <Select value={formData.plan_type} onValueChange={(value) => updateFormData('plan_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled Care</SelectItem>
                        <SelectItem value="on-demand">On-Demand Care</SelectItem>
                        <SelectItem value="both">Both Scheduled & On-Demand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weekday_coverage">Weekday Coverage</Label>
                    <Select value={formData.weekday_coverage} onValueChange={(value) => updateFormData('weekday_coverage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8am-4pm">8 AM - 4 PM</SelectItem>
                        <SelectItem value="6am-6pm">6 AM - 6 PM</SelectItem>
                        <SelectItem value="6pm-8am">6 PM - 8 AM (Overnight)</SelectItem>
                        <SelectItem value="none">No weekday coverage needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="weekend_coverage">Weekend Coverage</Label>
                    <Select value={formData.weekend_coverage} onValueChange={(value) => updateFormData('weekend_coverage', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes, weekend coverage needed</SelectItem>
                        <SelectItem value="no">No weekend coverage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="communication_method">Preferred Communication</Label>
                    <Select value={formData.communication_method} onValueChange={(value) => updateFormData('communication_method', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone calls</SelectItem>
                        <SelectItem value="text">Text messages</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="daily_report_required"
                    checked={formData.daily_report_required}
                    onCheckedChange={(checked) => updateFormData('daily_report_required', checked)}
                  />
                  <Label htmlFor="daily_report_required">Daily care reports required</Label>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => updateFormData('emergency_contact_phone', e.target.value)}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                  <Input
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => updateFormData('emergency_contact_relationship', e.target.value)}
                    placeholder="e.g., Daughter, Son, Spouse"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Information & Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="diagnosed_conditions">Diagnosed Medical Conditions</Label>
                  <Textarea
                    id="diagnosed_conditions"
                    value={formData.diagnosed_conditions}
                    onChange={(e) => updateFormData('diagnosed_conditions', e.target.value)}
                    placeholder="Please list any diagnosed medical conditions, medications, or health concerns..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="cognitive_notes">Cognitive & Memory Notes</Label>
                  <Textarea
                    id="cognitive_notes"
                    value={formData.cognitive_notes}
                    onChange={(e) => updateFormData('cognitive_notes', e.target.value)}
                    placeholder="Any cognitive challenges, memory issues, or special considerations..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="additional_notes">Additional Care Notes</Label>
                  <Textarea
                    id="additional_notes"
                    value={formData.additional_notes}
                    onChange={(e) => updateFormData('additional_notes', e.target.value)}
                    placeholder="Any other important information about care preferences, personality, or special needs..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="px-8"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {existingAssessment ? "Updating..." : "Submitting..."}
                  </div>
                ) : (
                  existingAssessment ? "Update Assessment" : "Complete Assessment"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
