import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TrainingProgramSection } from "@/components/professional/TrainingProgramSection";
import { TrainingModulesSection } from "@/components/professional/TrainingModulesSection";
import { TrainingProgressTracker } from "@/components/professional/TrainingProgressTracker";
import { ProfileHeaderSection } from "@/components/professional/profile/ProfileHeaderSection";
import { CarePlanSelector } from "@/components/professional/profile/CarePlanSelector";
import { AdminAssistantCard } from "@/components/professional/profile/AdminAssistantCard";
import { ActionCardsGrid } from "@/components/professional/profile/ActionCardsGrid";
import { CarePlanTabs } from "@/components/professional/profile/CarePlanTabs";
import { Award } from "lucide-react";
import { toast } from "sonner";

// Types for the data structures
interface ProfessionalDetails {
  full_name: string;
  professional_type: string;
  avatar_url: string | null;
}

interface CareTeamAssignment {
  id: string;
  care_plan_id: string;
  family_id: string;
  role: string;
  status: string;
  notes: string;
  created_at: string;
  care_plans?: {
    id: string;
    title: string;
    description: string;
    status: string;
    family_id: string;
    profiles?: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      phone_number: string;
    };
  };
}

interface CarePlanAssignment {
  id: string;
  carePlanId: string;
  familyId: string;
  role: string;
  status: string;
  notes: string;
  createdAt: string;
  carePlan?: {
    id: string;
    title: string;
    description: string;
    status: string;
    familyId: string;
    familyProfile?: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
      phoneNumber: string;
    };
  };
}

interface CareTeamMember {
  id: string;
  carePlanId: string;
  caregiverId: string;
  role: string;
  status: string;
  professionalDetails?: ProfessionalDetails;
}

const ProfessionalProfileHub = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [carePlanAssignments, setCarePlanAssignments] = useState<CarePlanAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarePlanId, setSelectedCarePlanId] = useState<string | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMember[]>([]);
  const [isTrainingExpanded, setIsTrainingExpanded] = useState(false);
  const [documentsData, setDocumentsData] = useState<any[]>([]); // Add documents state for smart navigation
  
  // Get initial tab from URL params, with different defaults based on care plan assignments
  const tabFromUrl = searchParams.get('tab');
  const hasCarePlans = carePlanAssignments.length > 0;
  const defaultTab = hasCarePlans ? "schedule" : "documents";
  const [activeTab, setActiveTab] = useState(tabFromUrl || defaultTab);

  // Update default tab when care plan assignments change
  useEffect(() => {
    if (!tabFromUrl) {
      const newDefaultTab = carePlanAssignments.length > 0 ? "schedule" : "documents";
      setActiveTab(newDefaultTab);
    }
  }, [carePlanAssignments.length, tabFromUrl]);

  const breadcrumbItems = [
    { label: "Professional Dashboard", path: "/dashboard/professional" },
    { label: "Profile Hub", path: "/professional/profile" },
  ];

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchProfessionalProfile(),
        fetchCarePlanAssignments(),
        fetchDocumentsData() // Add documents fetch for smart navigation
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // Set default selected care plan when assignments are loaded
  useEffect(() => {
    if (carePlanAssignments.length > 0 && !selectedCarePlanId) {
      const firstActivePlan = carePlanAssignments.find(assignment => 
        assignment.status === 'active' && assignment.carePlan?.status === 'active'
      );
      if (firstActivePlan) {
        setSelectedCarePlanId(firstActivePlan.carePlanId);
      }
    }
  }, [carePlanAssignments, selectedCarePlanId]);

  // Fetch care team members when selected care plan changes
  useEffect(() => {
    if (selectedCarePlanId) {
      fetchCareTeamMembers(selectedCarePlanId);
    }
  }, [selectedCarePlanId]);

  // Update active tab when URL changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const fetchProfessionalProfile = async () => {
    try {
      console.log("Fetching professional profile for user:", user?.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        return;
      }

      console.log("Professional profile data:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error in fetchProfessionalProfile:", error);
      toast.error("Failed to load profile");
    }
  };

  const fetchCarePlanAssignments = async () => {
    try {
      console.log("Fetching care plan assignments for professional:", user?.id);
      
      // Fetch both care team assignments AND admin manual matches
      const [careTeamResult, adminMatchResult] = await Promise.all([
        // Regular care team assignments
        supabase
          .from('care_team_members')
          .select('*')
          .eq('caregiver_id', user?.id),
        
        // Admin manual matches
        supabase
          .from('admin_match_interventions')
          .select('*')
          .eq('caregiver_id', user?.id)
          .eq('status', 'active')
      ]);

      const { data: rawAssignments, error: assignmentsError } = careTeamResult;
      const { data: adminMatches, error: adminMatchError } = adminMatchResult;

      if (assignmentsError) {
        throw assignmentsError;
      }

      if (adminMatchError) {
        console.warn("Error fetching admin matches:", adminMatchError);
      }

      console.log("Raw care team assignments:", rawAssignments);
      console.log("Admin manual matches:", adminMatches);
      console.log("Total care team assignments found:", rawAssignments?.length || 0);
      console.log("Total admin matches found:", adminMatches?.length || 0);

      // Create assignments list from both sources
      const allAssignments = [...(rawAssignments || [])];
      const allCarePlanIds = new Set(allAssignments.map(a => a.care_plan_id));

      // Add admin matches as assignments (they don't have care_plan_id, so we'll handle them separately)
      const adminAssignments = (adminMatches || []).map(match => ({
        id: `admin_${match.id}`,
        care_plan_id: null, // Admin matches don't have care plans
        family_id: match.family_user_id,
        caregiver_id: match.caregiver_id,
        role: 'manually_assigned',
        status: 'active',
        notes: match.notes || `Admin assigned: ${match.reason || 'Manual match'}`,
        created_at: match.created_at,
        is_admin_match: true,
        admin_match_data: match
      }));

      console.log("Created admin assignments:", adminAssignments);
      
      // Combine all assignments
      const combinedAssignments = [...allAssignments, ...adminAssignments];

      if (combinedAssignments.length === 0) {
        console.log("No assignments found for professional");
        setCarePlanAssignments([]);
        return;
      }

      // Extract unique care plan IDs (only from regular assignments)
      const carePlanIds = [...new Set(rawAssignments.map(assignment => assignment.care_plan_id))];
      console.log("Care plan IDs to fetch:", carePlanIds);
      console.log("Number of care plan IDs to fetch:", carePlanIds.length);

      // Extract unique family IDs from both regular assignments and admin matches
      const familyIdsFromAssignments = new Set(rawAssignments.map(a => a.family_id));
      const familyIdsFromAdminMatches = new Set(adminMatches?.map(m => m.family_user_id) || []);
      const allFamilyIds = [...new Set([...familyIdsFromAssignments, ...familyIdsFromAdminMatches])];
      console.log("All family IDs to fetch:", allFamilyIds);

      // Fetch care plan details and family profiles in parallel
      const [carePlansResult, familyProfilesResult] = await Promise.all([
        // Fetch care plans (only for regular assignments)
        carePlanIds.length > 0 ? supabase
          .from('care_plans')
          .select('*')
          .in('id', carePlanIds) : { data: [], error: null },
        
        // Fetch family profiles (for both regular and admin assignments)
        allFamilyIds.length > 0 ? supabase
          .from('profiles')
          .select('id, full_name, avatar_url, phone_number')
          .in('id', allFamilyIds) : { data: [], error: null }
      ]);

      const { data: carePlansData, error: carePlansError } = carePlansResult;
      const { data: familyProfilesData, error: familyProfilesError } = familyProfilesResult;

      if (carePlansError) {
        throw carePlansError;
      }

      if (familyProfilesError) {
        throw familyProfilesError;
      }

      console.log("Raw care plans data:", carePlansData);
      console.log("Number of care plans retrieved:", carePlansData?.length || 0);
      console.log("Raw family profiles data:", familyProfilesData);
      console.log("Number of family profiles retrieved:", familyProfilesData?.length || 0);

      // Transform regular assignments
      const transformedRegularAssignments: CarePlanAssignment[] = rawAssignments.map(assignment => {
        const carePlan = carePlansData?.find(plan => plan.id === assignment.care_plan_id);
        const familyProfile = familyProfilesData?.find(profile => profile.id === assignment.family_id);

        return {
          id: assignment.id,
          carePlanId: assignment.care_plan_id,
          familyId: assignment.family_id,
          role: assignment.role,
          status: assignment.status,
          notes: assignment.notes || '',
          createdAt: assignment.created_at,
          carePlan: carePlan ? {
            id: carePlan.id,
            title: carePlan.title,
            description: carePlan.description,
            status: carePlan.status,
            familyId: carePlan.family_id,
            familyProfile: familyProfile ? {
              id: familyProfile.id,
              fullName: familyProfile.full_name,
              avatarUrl: familyProfile.avatar_url,
              phoneNumber: familyProfile.phone_number
            } : undefined
          } : undefined
        };
      });

      // Transform admin matches to assignment format
      const transformedAdminAssignments: CarePlanAssignment[] = adminAssignments.map(assignment => {
        const familyProfile = familyProfilesData?.find(profile => profile.id === assignment.family_id);

        return {
          id: assignment.id,
          carePlanId: null, // Admin matches don't have care plans
          familyId: assignment.family_id,
          role: assignment.role,
          status: assignment.status,
          notes: assignment.notes || '',
          createdAt: assignment.created_at,
          carePlan: {
            id: 'admin_match',
            title: `Manual Assignment - ${familyProfile?.full_name || 'Family'}`,
            description: assignment.notes || 'Admin manual assignment',
            status: 'active',
            familyId: assignment.family_id,
            familyProfile: familyProfile ? {
              id: familyProfile.id,
              fullName: familyProfile.full_name,
              avatarUrl: familyProfile.avatar_url,
              phoneNumber: familyProfile.phone_number
            } : undefined
          }
        };
      });

      // Combine all assignments
      const allTransformedAssignments = [...transformedRegularAssignments, ...transformedAdminAssignments];

      console.log("Transformed regular assignments:", transformedRegularAssignments);
      console.log("Transformed admin assignments:", transformedAdminAssignments);
      console.log("All transformed assignments:", allTransformedAssignments);
      console.log("Total assignments:", allTransformedAssignments.length);
      
      setCarePlanAssignments(allTransformedAssignments);
    } catch (error) {
      console.error("Error fetching care plan assignments:", error);
      toast.error("Failed to load care plan assignments");
    }
  };

  const fetchDocumentsData = async () => {
    try {
      console.log("Fetching documents for smart navigation:", user?.id);
      
      const { data: documents, error } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('user_id', user?.id);

      if (error) {
        console.error("Error fetching documents:", error);
        return;
      }

      console.log("Documents data for smart navigation:", documents);
      setDocumentsData(documents || []);
    } catch (error) {
      console.error("Error in fetchDocumentsData:", error);
    }
  };

  const fetchCareTeamMembers = async (carePlanId: string) => {
    try {
      console.log("Fetching team members for care plan:", carePlanId);
      
      const { data, error } = await supabase
        .from('care_team_members')
        .select(`
          id,
          care_plan_id,
          caregiver_id,
          role,
          status,
          profiles:profiles!care_team_members_caregiver_id_fkey(
            full_name,
            professional_type,
            avatar_url
          )
        `)
        .eq('care_plan_id', carePlanId)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      console.log("Team members for plan", carePlanId + ":", data);
      console.log("Number of team members for plan", carePlanId + ":", data?.length || 0);

      // Transform to expected structure
      const transformedMembers: CareTeamMember[] = (data || []).map(member => ({
        id: member.id,
        carePlanId: member.care_plan_id,
        caregiverId: member.caregiver_id,
        role: member.role,
        status: member.status,
        professionalDetails: member.profiles ? {
          full_name: member.profiles.full_name,
          professional_type: member.profiles.professional_type,
          avatar_url: member.profiles.avatar_url
        } : undefined
      }));

      setCareTeamMembers(transformedMembers);
    } catch (error) {
      console.error("Error fetching care team members:", error);
      toast.error("Failed to load care team members");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getProfessionalTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'cna': 'Certified Nursing Assistant',
      'lpn': 'Licensed Practical Nurse',
      'rn': 'Registered Nurse',
      'gapp': 'General Adult Patient Provider',
      'companion': 'Companion Caregiver',
      'home_health_aide': 'Home Health Aide',
      'other': 'Care Professional'
    };
    return typeMap[type] || 'Care Professional';
  };

  const selectedCarePlan = carePlanAssignments.find(assignment => assignment.carePlanId === selectedCarePlanId);

  // Updated certificate upload success handler with smart navigation
  const handleCertificateUploadSuccess = () => {
    toast.success("Document uploaded successfully! Redirecting to documents tab...");
    setActiveTab("documents");
    // Refresh documents data after upload
    fetchDocumentsData();
  };

  // Smart document navigation handler
  const handleDocumentNavigation = () => {
    const hasExistingDocuments = documentsData && documentsData.length > 0;
    
    if (hasExistingDocuments) {
      // User has documents, navigate to manage view
      setActiveTab("documents");
      // Could also use URL params to specify manage mode
      window.history.pushState({}, '', '/professional/profile?tab=documents&action=manage');
    } else {
      // New user, navigate to upload view
      setActiveTab("documents");
      // Could also use URL params to specify upload mode
      window.history.pushState({}, '', '/professional/profile?tab=documents&action=upload');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Profile Header Section */}
          <ProfileHeaderSection 
            profile={profile} 
            user={user} 
            carePlanAssignments={carePlanAssignments} 
          />

          {/* Care Plan Selection - Only show if user has assignments */}
          {carePlanAssignments.length > 0 && (
            <CarePlanSelector 
              carePlanAssignments={carePlanAssignments}
              selectedCarePlanId={selectedCarePlanId}
              onSelectCarePlan={setSelectedCarePlanId}
            />
          )}

          {/* Tabs for Different Views - Show for all users */}
          <CarePlanTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedCarePlanId={selectedCarePlanId}
            selectedCarePlan={selectedCarePlan}
            loading={loading}
            onCertificateUploadSuccess={handleCertificateUploadSuccess}
            showCarePlanTabs={carePlanAssignments.length > 0}
          />

          {/* Admin Assistant Card - Only show for users with care plans */}
          {carePlanAssignments.length > 0 && <AdminAssistantCard />}

          {/* Action Cards */}
          <ActionCardsGrid 
            isTrainingExpanded={isTrainingExpanded}
            onToggleTraining={() => setIsTrainingExpanded(!isTrainingExpanded)}
          />

          {/* Training Content - Expandable Section with Training Progress */}
          {isTrainingExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary-600" />
                    Comprehensive Training Program
                  </CardTitle>
                  <CardDescription>
                    A three-step approach blending self-paced learning, hands-on experience, and career development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <TrainingProgressTracker />
                    <TrainingProgramSection />
                    <TrainingModulesSection />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessionalProfileHub;
