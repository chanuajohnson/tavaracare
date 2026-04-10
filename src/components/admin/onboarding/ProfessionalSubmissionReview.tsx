
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardCheck, FileText, Users, Stethoscope } from "lucide-react";

interface ProfessionalSubmissionReviewProps {
  professionalId: string;
}

interface ProfileData {
  full_name: string | null;
  professional_type: string | null;
  years_of_experience: string | null;
  certifications: string[] | null;
  care_types: string[] | null;
  specialized_care: string[] | null;
  care_schedule: string | null;
  hourly_rate: string | null;
  expected_rate: string | null;
  background_check: boolean | null;
  background_check_proof_url: string | null;
  legally_authorized: boolean | null;
  languages: string[] | null;
  availability: string[] | null;
  work_type: string | null;
  location: string | null;
  phone_number: string | null;
  address: string | null;
  preferred_work_locations: string | null;
  commute_mode: string | null;
  bio: string | null;
}

interface DocumentData {
  id: string;
  document_type: string | null;
  document_subtype: string | null;
  file_name: string | null;
  verification_status: string | null;
  created_at: string | null;
}

interface ReferenceData {
  id: string;
  reference_name: string | null;
  reference_relationship: string | null;
  reference_phone: string | null;
  reference_email: string | null;
  years_known: string | null;
  status: string | null;
}

interface ScreeningData {
  id: string;
  screening_type: string | null;
  status: string | null;
  rating: number | null;
  recommendation: string | null;
  interviewer_name: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

export default function ProfessionalSubmissionReview({ professionalId }: ProfessionalSubmissionReviewProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [screenings, setScreenings] = useState<ScreeningData[]>([]);

  useEffect(() => {
    if (!professionalId) return;
    setLoading(true);

    const fetchAll = async () => {
      const [profileRes, docsRes, refsRes, screenRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, professional_type, years_of_experience, certifications, care_types, specialized_care, care_schedule, hourly_rate, expected_rate, background_check, background_check_proof_url, legally_authorized, languages, availability, work_type, location, phone_number, address, preferred_work_locations, commute_mode, bio")
          .eq("id", professionalId)
          .single(),
        supabase
          .from("professional_documents")
          .select("id, document_type, document_subtype, file_name, verification_status, created_at")
          .eq("user_id", professionalId)
          .order("created_at", { ascending: false }),
        supabase
          .from("professional_references")
          .select("id, reference_name, reference_relationship, reference_phone, reference_email, years_known, status")
          .eq("professional_id", professionalId),
        supabase
          .from("professional_screening")
          .select("id, screening_type, status, rating, recommendation, interviewer_name, scheduled_at, completed_at, notes")
          .eq("professional_id", professionalId),
      ]);

      setProfile(profileRes.data);
      setDocuments((docsRes.data || []) as DocumentData[]);
      setReferences((refsRes.data || []) as ReferenceData[]);
      setScreenings((screenRes.data || []) as ScreeningData[]);
      setLoading(false);
    };

    fetchAll();
  }, [professionalId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading professional data…</span>
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
        {value ? "✅" : "❌"} {label}
      </Badge>
    );
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "verified": case "passed": case "completed": return "default";
      case "pending": case "in_progress": case "scheduled": return "secondary";
      case "flagged": case "failed": case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getVerificationColor = (status: string | null) => {
    switch (status) {
      case "verified": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Registration / Profile Data */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
            Professional Registration Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {profile ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderField("Full Name", profile.full_name)}
                {renderField("Professional Type", profile.professional_type?.replace(/_/g, " "))}
                {renderField("Years of Experience", profile.years_of_experience)}
                {renderField("Work Type", profile.work_type?.replace(/_/g, " "))}
                {renderField("Hourly Rate", profile.hourly_rate)}
                {renderField("Expected Rate", profile.expected_rate)}
                {renderField("Location", profile.location)}
                {renderField("Phone", profile.phone_number)}
                {renderField("Address", profile.address)}
                {renderField("Preferred Work Locations", profile.preferred_work_locations)}
                {renderField("Commute Mode", profile.commute_mode?.replace(/_/g, " "))}
                {renderField("Care Schedule", profile.care_schedule)}
              </div>
              {renderArrayField("Certifications", profile.certifications)}
              {renderArrayField("Care Types", profile.care_types)}
              {renderArrayField("Specialized Care", profile.specialized_care)}
              {renderArrayField("Languages", profile.languages)}
              {renderArrayField("Availability", profile.availability)}
              {profile.bio && renderField("Bio", profile.bio)}
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">Verification Status</span>
                <div className="flex flex-wrap gap-1">
                  {renderBoolField("Background Check", profile.background_check)}
                  {renderBoolField("Legally Authorized", profile.legally_authorized)}
                  {profile.background_check_proof_url && (
                    <Badge variant="default" className="text-xs">📄 Background Check Proof on File</Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No professional registration data found.</p>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-background rounded-md border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name || "Unnamed document"}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.document_type || "unknown").replace(/_/g, " ")}
                      {doc.document_subtype && ` — ${doc.document_subtype.replace(/_/g, " ")}`}
                    </p>
                  </div>
                  <Badge variant={getVerificationColor(doc.verification_status)} className="text-xs ml-2 shrink-0">
                    {(doc.verification_status || "pending").replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No documents uploaded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* References */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-600" />
            References ({references.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {references.length > 0 ? (
            <div className="space-y-2">
              {references.map((ref) => (
                <div key={ref.id} className="p-2 bg-background rounded-md border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{ref.reference_name || "Unnamed reference"}</p>
                    <Badge variant={getStatusColor(ref.status)} className="text-xs">
                      {(ref.status || "pending").replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    {ref.reference_relationship && <span>Relationship: {ref.reference_relationship}</span>}
                    {ref.years_known && <span>Years Known: {ref.years_known}</span>}
                    {ref.reference_phone && <span>Phone: {ref.reference_phone}</span>}
                    {ref.reference_email && <span>Email: {ref.reference_email}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No references submitted yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Screening Results */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-purple-600" />
            Screening Results ({screenings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {screenings.length > 0 ? (
            <div className="space-y-2">
              {screenings.map((s) => (
                <div key={s.id} className="p-2 bg-background rounded-md border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{(s.screening_type || "screening").replace(/_/g, " ")}</p>
                    <Badge variant={getStatusColor(s.status)} className="text-xs">
                      {(s.status || "pending").replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    {s.interviewer_name && <span>Interviewer: {s.interviewer_name}</span>}
                    {s.rating !== null && <span>Rating: {s.rating}/5</span>}
                    {s.recommendation && <span>Recommendation: {s.recommendation}</span>}
                    {s.completed_at && <span>Completed: {new Date(s.completed_at).toLocaleDateString()}</span>}
                  </div>
                  {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No screening results yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
