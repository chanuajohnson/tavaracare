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
import { Brain, User, Phone, Heart, AlertCircle, Calendar, Brain, Home, Car, Sparkles } from "lucide-react";

interface CareNeedsFormData {
  // Header fields
  care_recipient_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  care_location: string;
  
  // Daily Living Tasks (ADLs)
  assistance_bathing: boolean;
  assistance_dressing: boolean;
  assistance_toileting: boolean;
  assistance_oral_care: boolean;
  assistance_feeding: boolean;
  assistance_mobility: boolean;
  assistance_medication: boolean;
  assistance_companionship: boolean;
  assistance_naps: boolean;
  
  // Cognitive / Memory Support
  dementia_redirection: boolean;
  memory_reminders: boolean;
  gentle_engagement: boolean;
  wandering_prevention: boolean;
  triggers_soothing_techniques: string;
  
  // Medical & Special Conditions
  diagnosed_conditions: string;
  chronic_illness_type: string;
  vitals_check: boolean;
  equipment_use: boolean;
  fall_monitoring: boolean;
  
  // Housekeeping & Meals
  tidy_room: boolean;
  laundry_support: boolean;
  meal_prep: boolean;
  grocery_runs: boolean;
  
  // Transportation
  escort_to_appointments: boolean;
  fresh_air_walks: boolean;
  
  // Emergency Protocols
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  known_allergies: string;
  emergency_plan: string;
  
  // Communication Preferences
  communication_method: string;
  daily_report_required: boolean;
  checkin_preference: string;
  
  // Cultural Preferences
  cultural_preferences: string;
  additional_notes: string;
}

const initialFormData: CareNeedsFormData = {
  care_recipient_name: "",
  primary_contact_name: "",
  primary_contact_phone: "",
  care_location: "",
  assistance_bathing: false,
  assistance_dressing: false,
  assistance_toileting: false,
  assistance_oral_care: false,
  assistance_feeding: false,
  assistance_mobility: false,
  assistance_medication: false,
  assistance_companionship: false,
  assistance_naps: false,
  dementia_redirection: false,
  memory_reminders: false,
  gentle_engagement: false,
  wandering_prevention: false,
  triggers_soothing_techniques: "",
  diagnosed_conditions: "",
  chronic_illness_type: "",
  vitals_check: false,
  equipment_use: false,
  fall_monitoring: false,
  tidy_room: false,
  laundry_support: false,
  meal_prep: false,
  grocery_runs: false,
  escort_to_appointments: false,
  fresh_air_walks: false,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  known_allergies: "",
  emergency_plan: "",
  communication_method: "text",
  daily_report_required: false,
  checkin_preference: "written",
  cultural_preferences: "",
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

    // Validate required fields
    if (!formData.care_recipient_name || !formData.primary_contact_name || !formData.primary_contact_phone || !formData.care_location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!formData.emergency_contact_name || !formData.emergency_contact_phone || !formData.emergency_contact_relationship) {
      toast.error("Please fill in all emergency contact fields.");
      return;
    }

    try {
      setSubmitting(true);

      const assessmentData = {
        profile_id: user.id,
        care_recipient_name: formData.care_recipient_name,
        primary_contact_name: formData.primary_contact_name,
        primary_contact_phone: formData.primary_contact_phone,
        care_location: formData.care_location,
        
        // Daily Living Tasks
        assistance_bathing: formData.assistance_bathing,
        assistance_dressing: formData.assistance_dressing,
        assistance_toileting: formData.assistance_toileting,
        assistance_oral_care: formData.assistance_oral_care,
        assistance_feeding: formData.assistance_feeding,
        assistance_mobility: formData.assistance_mobility,
        assistance_medication: formData.assistance_medication,
        assistance_companionship: formData.assistance_companionship,
        assistance_naps: formData.assistance_naps,
        
        // Cognitive Support
        dementia_redirection: formData.dementia_redirection,
        memory_reminders: formData.memory_reminders,
        gentle_engagement: formData.gentle_engagement,
        wandering_prevention: formData.wandering_prevention,
        triggers_soothing_techniques: formData.triggers_soothing_techniques || null,
        
        // Medical Conditions
        diagnosed_conditions: formData.diagnosed_conditions || null,
        chronic_illness_type: formData.chronic_illness_type || null,
        vitals_check: formData.vitals_check,
        equipment_use: formData.equipment_use,
        fall_monitoring: formData.fall_monitoring,
        
        // Housekeeping & Meals
        tidy_room: formData.tidy_room,
        laundry_support: formData.laundry_support,
        meal_prep: formData.meal_prep,
        grocery_runs: formData.grocery_runs,
        
        // Transportation
        escort_to_appointments: formData.escort_to_appointments,
        fresh_air_walks: formData.fresh_air_walks,
        
        // Emergency Protocols
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        known_allergies: formData.known_allergies || null,
        emergency_plan: formData.emergency_plan || null,
        
        // Communication Preferences
        communication_method: formData.communication_method,
        daily_report_required: formData.daily_report_required,
        checkin_preference: formData.checkin_preference,
        
        // Cultural Preferences
        cultural_preferences: formData.cultural_preferences || null,
        additional_notes: formData.additional_notes || null,
        
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
        console.error("Database error:", error);
        throw error;
      }

      toast.success(existingAssessment ? "Assessment updated successfully!" : "Assessment completed successfully!");
      
      // Redirect back to family dashboard
      setTimeout(() => {
        window.location.href = "/dashboard/family";
      }, 1500);
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
            <h1 className="text-3xl font-bold text-primary-900 mb-2 flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Client Care Needs Breakdown
            </h1>
            <p className="text-lg text-gray-600">
              Help us understand your loved one's specific care requirements to match you with the right caregiver.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Information */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="care_recipient_name">Care Recipient Name *</Label>
                    <Input
                      id="care_recipient_name"
                      value={formData.care_recipient_name}
                      onChange={(e) => updateFormData('care_recipient_name', e.target.value)}
                      placeholder="Full name of care recipient"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary_contact_name">Primary Contact *</Label>
                    <Input
                      id="primary_contact_name"
                      value={formData.primary_contact_name}
                      onChange={(e) => updateFormData('primary_contact_name', e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_contact_phone">Primary Contact Phone *</Label>
                    <Input
                      id="primary_contact_phone"
                      value={formData.primary_contact_phone}
                      onChange={(e) => updateFormData('primary_contact_phone', e.target.value)}
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="care_location">Care Location *</Label>
                    <Input
                      id="care_location"
                      value={formData.care_location}
                      onChange={(e) => updateFormData('care_location', e.target.value)}
                      placeholder="Address where care will be provided"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Living Tasks */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  🛌 Daily Living Tasks (ADLs)
                </CardTitle>
                <p className="text-sm text-gray-600">Check any that are required regularly:</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'assistance_bathing', label: 'Assistance with bathing' },
                  { key: 'assistance_dressing', label: 'Dressing / changing clothes' },
                  { key: 'assistance_toileting', label: 'Toileting / incontinence care' },
                  { key: 'assistance_oral_care', label: 'Oral care / dentures' },
                  { key: 'assistance_feeding', label: 'Feeding / meal prep' },
                  { key: 'assistance_mobility', label: 'Assistance walking or repositioning' },
                  { key: 'assistance_medication', label: 'Medication reminders' },
                  { key: 'assistance_companionship', label: 'Companionship / supervision' },
                  { key: 'assistance_naps', label: 'Help with naps or rest periods' }
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

            {/* Cognitive / Memory Support */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  🧠 Cognitive / Memory Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'dementia_redirection', label: 'Dementia-related redirection' },
                    { key: 'memory_reminders', label: 'Memory reminders (meals, meds, hygiene)' },
                    { key: 'gentle_engagement', label: 'Gentle engagement (music, puzzles, talk)' },
                    { key: 'wandering_prevention', label: 'Prevention of wandering or risk behavior' }
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
                </div>
                <div>
                  <Label htmlFor="triggers_soothing_techniques">Describe any known triggers or soothing techniques:</Label>
                  <Textarea
                    id="triggers_soothing_techniques"
                    value={formData.triggers_soothing_techniques}
                    onChange={(e) => updateFormData('triggers_soothing_techniques', e.target.value)}
                    placeholder="e.g. Gets confused after sunset, responds well to soft music"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical & Special Conditions */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  ❤️ Medical & Special Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="diagnosed_conditions">Diagnosed conditions:</Label>
                  <Textarea
                    id="diagnosed_conditions"
                    value={formData.diagnosed_conditions}
                    onChange={(e) => updateFormData('diagnosed_conditions', e.target.value)}
                    placeholder="List any diagnosed medical conditions..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="chronic_illness_type">Chronic Illness (please specify type if known):</Label>
                  <Input
                    id="chronic_illness_type"
                    value={formData.chronic_illness_type}
                    onChange={(e) => updateFormData('chronic_illness_type', e.target.value)}
                    placeholder="e.g., Diabetes, Heart Disease, COPD"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'vitals_check', label: 'Blood pressure or glucose checks' },
                    { key: 'equipment_use', label: 'Use of medical equipment (e.g. walker, nebulizer)' },
                    { key: 'fall_monitoring', label: 'Fall risk monitoring' }
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
                </div>
              </CardContent>
            </Card>

            {/* Housekeeping & Meals */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-500" />
                  🧽 Housekeeping & Meals
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'tidy_room', label: 'Light tidying in care area' },
                  { key: 'laundry_support', label: 'Laundry support' },
                  { key: 'meal_prep', label: 'Meal prep (breakfast / lunch / snacks)' },
                  { key: 'grocery_runs', label: 'Grocery pickup or errand help' }
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

            {/* Transportation */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-orange-500" />
                  🛣️ Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'escort_to_appointments', label: 'Escort to appointments' },
                  { key: 'fresh_air_walks', label: 'Short walks or fresh air breaks' }
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

            {/* Emergency Protocols */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-yellow-500" />
                  👩‍⚕️ Emergency Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
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
                  <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
                  <Input
                    id="emergency_contact_relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => updateFormData('emergency_contact_relationship', e.target.value)}
                    placeholder="e.g., Brother, Sister, Spouse"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="known_allergies">Known allergies or emergencies:</Label>
                  <Textarea
                    id="known_allergies"
                    value={formData.known_allergies}
                    onChange={(e) => updateFormData('known_allergies', e.target.value)}
                    placeholder="List any allergies, medical emergencies to watch for..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_plan">Plan if symptoms worsen:</Label>
                  <Textarea
                    id="emergency_plan"
                    value={formData.emergency_plan}
                    onChange={(e) => updateFormData('emergency_plan', e.target.value)}
                    placeholder="What should the caregiver do if symptoms worsen..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card className="border-l-4 border-l-teal-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-teal-500" />
                  💬 Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="communication_method">Best way to update caregiver/family:</Label>
                  <Select value={formData.communication_method} onValueChange={(value) => updateFormData('communication_method', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text message</SelectItem>
                      <SelectItem value="phone">Phone calls</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="daily_report_required"
                    checked={formData.daily_report_required}
                    onCheckedChange={(checked) => updateFormData('daily_report_required', checked)}
                  />
                  <Label htmlFor="daily_report_required">Daily care notes needed?</Label>
                </div>
                <div>
                  <Label htmlFor="checkin_preference">Photo check-ins or verbal reports preferred?</Label>
                  <Select value={formData.checkin_preference} onValueChange={(value) => updateFormData('checkin_preference', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                      <SelectItem value="written">Written</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cultural Preferences */}
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  ✨ Extra Notes / Cultural Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cultural_preferences">Religious observances, dietary restrictions, personality preferences, etc.</Label>
                  <Textarea
                    id="cultural_preferences"
                    value={formData.cultural_preferences}
                    onChange={(e) => updateFormData('cultural_preferences', e.target.value)}
                    placeholder="Any religious observances, dietary restrictions, personality preferences, etc."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <Textarea
                    id="additional_notes"
                    value={formData.additional_notes}
                    onChange={(e) => updateFormData('additional_notes', e.target.value)}
                    placeholder="Any other important information about care preferences..."
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
