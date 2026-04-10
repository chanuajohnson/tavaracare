
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Heart, ClipboardCheck } from "lucide-react";

interface FamilySubmissionReviewProps {
  familyId: string;
}

interface RegistrationData {
  full_name: string | null;
  care_recipient_name: string | null;
  relationship: string | null;
  care_types: string[] | null;
  special_needs: string[] | null;
  care_schedule: string | null;
  budget_preferences: string | null;
  caregiver_type: string | null;
  caregiver_preferences: string | null;
  additional_notes: string | null;
  phone_number: string | null;
  address: string | null;
  preferred_contact_method: string | null;
}

interface CareAssessmentData {
  care_recipient_name: string | null;
  care_location: string | null;
  diagnosed_conditions: string | null;
  weekday_coverage: string | null;
  weekend_coverage: string | null;
  assistance_bathing: boolean | null;
  assistance_dressing: boolean | null;
  assistance_feeding: boolean | null;
  assistance_mobility: boolean | null;
  assistance_medication: boolean | null;
  assistance_toileting: boolean | null;
  assistance_companionship: boolean | null;
  cultural_preferences: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  additional_notes: string | null;
}

interface LegacyStoryData {
  full_name: string;
  birth_year: string;
  personality_traits: string[] | null;
  hobbies_interests: string[] | null;
  daily_routines: string | null;
  joyful_things: string | null;
  cultural_preferences: string | null;
  life_story: string | null;
  challenges: string[] | null;
}

export default function FamilySubmissionReview({ familyId }: FamilySubmissionReviewProps) {
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [assessment, setAssessment] = useState<CareAssessmentData | null>(null);
  const [legacyStory, setLegacyStory] = useState<LegacyStoryData | null>(null);

  useEffect(() => {
    if (!familyId) return;
    setLoading(true);

    const fetchAll = async () => {
      const [regRes, assessRes, storyRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, care_recipient_name, relationship, care_types, special_needs, care_schedule, budget_preferences, caregiver_type, caregiver_preferences, additional_notes, phone_number, address, preferred_contact_method")
          .eq("id", familyId)
          .single(),
        supabase
          .from("care_needs_family")
          .select("*")
          .eq("profile_id", familyId)
          .maybeSingle(),
        supabase
          .from("care_recipient_profiles")
          .select("*")
          .eq("user_id", familyId)
          .maybeSingle(),
      ]);

      setRegistration(regRes.data);
      setAssessment(assessRes.data);
      setLegacyStory(storyRes.data);
      setLoading(false);
    };

    fetchAll();
  }, [familyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading family data…</span>
      </div>
    );
  }

  const renderField = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm">{value}</span>
      </div>
    );
  };

  const renderArrayField = (label: string, values: string[] | null | undefined) => {
    if (!values || values.length === 0) return null;
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex flex-wrap gap-1">
          {values.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {v.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderBoolField = (label: string, value: boolean | null | undefined) => {
    if (value === null || value === undefined) return null;
    return (
      <Badge variant={value ? "default" : "outline"} className="text-xs">
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Registration Summary */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
            Registration Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {registration ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderField("Family Contact", registration.full_name)}
              {renderField("Phone", registration.phone_number)}
              {renderField("Address", registration.address)}
              {renderField("Care Recipient", registration.care_recipient_name)}
              {renderField("Relationship", registration.relationship)}
              {renderField("Budget", registration.budget_preferences?.replace(/_/g, " "))}
              {renderField("Caregiver Type", registration.caregiver_type?.replace(/_/g, " "))}
              {renderField("Contact Method", registration.preferred_contact_method)}
              {renderArrayField("Care Types", registration.care_types)}
              {renderArrayField("Special Needs", registration.special_needs)}
              {renderField("Care Schedule", registration.care_schedule)}
              {renderField("Caregiver Preferences", registration.caregiver_preferences)}
              {renderField("Additional Notes", registration.additional_notes)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No registration data found.</p>
          )}
        </CardContent>
      </Card>

      {/* Care Assessment Summary */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            Care Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {assessment ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderField("Care Recipient", assessment.care_recipient_name)}
                {renderField("Care Location", assessment.care_location)}
                {renderField("Diagnosed Conditions", assessment.diagnosed_conditions)}
                {renderField("Weekday Coverage", assessment.weekday_coverage)}
                {renderField("Weekend Coverage", assessment.weekend_coverage)}
                {renderField("Cultural Preferences", assessment.cultural_preferences)}
                {renderField("Emergency Contact", assessment.emergency_contact_name)}
                {renderField("Emergency Phone", assessment.emergency_contact_phone)}
                {renderField("Notes", assessment.additional_notes)}
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">ADL Assistance Needed</span>
                <div className="flex flex-wrap gap-1">
                  {renderBoolField("Bathing", assessment.assistance_bathing)}
                  {renderBoolField("Dressing", assessment.assistance_dressing)}
                  {renderBoolField("Feeding", assessment.assistance_feeding)}
                  {renderBoolField("Mobility", assessment.assistance_mobility)}
                  {renderBoolField("Medication", assessment.assistance_medication)}
                  {renderBoolField("Toileting", assessment.assistance_toileting)}
                  {renderBoolField("Companionship", assessment.assistance_companionship)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No care assessment submitted yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Legacy Story Summary */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-600" />
            Legacy Story
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {legacyStory ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderField("Full Name", legacyStory.full_name)}
                {renderField("Birth Year", legacyStory.birth_year)}
                {renderField("Daily Routines", legacyStory.daily_routines)}
                {renderField("Joyful Things", legacyStory.joyful_things)}
                {renderField("Cultural Preferences", legacyStory.cultural_preferences)}
                {renderField("Life Story", legacyStory.life_story)}
              </div>
              {renderArrayField("Personality Traits", legacyStory.personality_traits)}
              {renderArrayField("Hobbies & Interests", legacyStory.hobbies_interests)}
              {renderArrayField("Challenges", legacyStory.challenges)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No legacy story submitted yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
