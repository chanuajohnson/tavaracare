import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProfessionalScheduleView } from "@/components/professional/ProfessionalScheduleView";
import { MedicationCard } from "@/components/medication/MedicationCard";
import { QuickAdministrationForm } from "@/components/medication/QuickAdministrationForm";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Award,
  ArrowRight,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Pill
} from "lucide-react";
import { toast } from "sonner";
import { MedicationWithAdministrations, medicationService } from "@/services/medicationService";

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
  const [profile, setProfile] = useState<any>(null);
  const [carePlanAssignments, setCarePlanAssignments] = useState<CarePlanAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarePlanId, setSelectedCarePlanId] = useState<string | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMember[]>([]);
  const [medications, setMedications] = useState<MedicationWithAdministrations[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<MedicationWithAdministrations | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const breadcrumbItems = [
    { label: "Professional Dashboard", path: "/dashboard/professional" },
    { label: "Profile Hub", path: "/professional/profile" },
  ];

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchProfessionalProfile(),
        fetchCarePlanAssignments()
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

  // Fetch care team members and medications when selected care plan changes
  useEffect(() => {
    if (selectedCarePlanId) {
      fetchCareTeamMembers(selectedCarePlanId);
      fetchMedicationsForCarePlan(selectedCarePlanId);
    }
  }, [selectedCarePlanId]);

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
      
      // First, get all care team assignments for this professional
      const { data: rawAssignments, error: assignmentsError } = await supabase
        .from('care_team_members')
        .select('*')
        .eq('caregiver_id', user?.id);

      if (assignmentsError) {
        throw assignmentsError;
      }

      console.log("Raw care team assignments:", rawAssignments);
      console.log("Total care team assignments found:", rawAssignments?.length || 0);

      if (!rawAssignments || rawAssignments.length === 0) {
        console.log("No care team assignments found for professional");
        setCarePlanAssignments([]);
        return;
      }

      // Extract unique care plan IDs
      const carePlanIds = [...new Set(rawAssignments.map(assignment => assignment.care_plan_id))];
      console.log("Care plan IDs to fetch:", carePlanIds);
      console.log("Number of care plan IDs to fetch:", carePlanIds.length);

      // Fetch care plan details
      const { data: carePlansData, error: carePlansError } = await supabase
        .from('care_plans')
        .select('*')
        .in('id', carePlanIds);

      if (carePlansError) {
        throw carePlansError;
      }

      console.log("Raw care plans data:", carePlansData);
      console.log("Number of care plans retrieved:", carePlansData?.length || 0);

      // Extract unique family IDs from care plans
      const familyIds = [...new Set(carePlansData?.map(plan => plan.family_id) || [])];
      console.log("Family IDs to fetch:", familyIds);

      // Fetch family profiles
      const { data: familyProfilesData, error: familyProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone_number')
        .in('id', familyIds);

      if (familyProfilesError) {
        throw familyProfilesError;
      }

      console.log("Raw family profiles data:", familyProfilesData);

      // Transform the data to match our expected structure
      const transformedAssignments: CarePlanAssignment[] = rawAssignments.map(assignment => {
        const carePlan = carePlansData?.find(plan => plan.id === assignment.care_plan_id);
        const familyProfile = familyProfilesData?.find(profile => profile.id === carePlan?.family_id);

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

      console.log("Transformed care plans:", transformedAssignments);
      console.log("Number of transformed care plans:", transformedAssignments.length);
      
      setCarePlanAssignments(transformedAssignments);
    } catch (error) {
      console.error("Error fetching care plan assignments:", error);
      toast.error("Failed to load care plan assignments");
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

  const fetchMedicationsForCarePlan = async (carePlanId: string) => {
    try {
      const medicationData = await medicationService.getMedicationsForCarePlan(carePlanId);
      setMedications(medicationData);
    } catch (error) {
      console.error("Error loading medications:", error);
      toast.error("Failed to load medications");
    }
  };

  const handleQuickAdminister = (medication: MedicationWithAdministrations) => {
    setSelectedMedication(medication);
    setShowAdminForm(true);
  };

  const handleAdministrationSuccess = () => {
    if (selectedCarePlanId) {
      fetchMedicationsForCarePlan(selectedCarePlanId); // Refresh medications
    }
  };

  // Helper functions for medication filtering
  const getUpcomingMedications = () => {
    return medications.filter(med => 
      med.next_dose && 
      new Date(med.next_dose) <= new Date(Date.now() + 2 * 60 * 60 * 1000) && // Next 2 hours
      new Date(med.next_dose) > new Date() // Not overdue
    );
  };

  const getOverdueMedications = () => {
    return medications.filter(med => 
      med.next_dose && 
      new Date(med.next_dose) < new Date()
    );
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

  const upcomingMeds = getUpcomingMedications();
  const overdueMeds = getOverdueMedications();

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
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Overview Card */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {getInitials(profile?.full_name || 'Professional')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{profile?.full_name || 'Professional'}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {getProfessionalTypeLabel(profile?.professional_type || 'other')}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {profile?.role === 'professional' ? 'Professional' : 'Caregiver'}
                      </Badge>
                      {profile?.years_of_experience && (
                        <Badge variant="outline" className="text-xs">
                          {profile.years_of_experience} Experience
                        </Badge>
                      )}
                      {profile?.legally_authorized && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Authorized
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link to="/professional/profile/edit">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.phone_number}</span>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  {profile?.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.hourly_rate}/hour</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="lg:w-80">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">Active Care Plans</span>
                    </div>
                    <Badge variant="secondary">
                      {carePlanAssignments.filter(a => a.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">This Week</span>
                    </div>
                    <Badge variant="outline">0 hrs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Care Plan Assignments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Care Plan Assignments
                  </CardTitle>
                  <CardDescription>
                    Families and care plans you're assigned to
                  </CardDescription>
                </div>
                {carePlanAssignments.length > 1 && (
                  <Select value={selectedCarePlanId || ''} onValueChange={setSelectedCarePlanId}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select care plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {carePlanAssignments.map((assignment) => (
                        <SelectItem key={assignment.carePlanId} value={assignment.carePlanId}>
                          {assignment.carePlan?.title || 'Untitled Care Plan'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {carePlanAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Care Plan Assignments</h3>
                  <p className="text-muted-foreground mt-1">
                    You're not currently assigned to any care plans.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carePlanAssignments.map((assignment) => (
                    <Card key={assignment.id} className={`border-l-4 ${
                      assignment.carePlanId === selectedCarePlanId ? 'border-l-primary bg-primary/5' : 'border-l-gray-200'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={assignment.carePlan?.familyProfile?.avatarUrl || ''} />
                                <AvatarFallback className="bg-primary text-white">
                                  {getInitials(assignment.carePlan?.familyProfile?.fullName || 'Family')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {assignment.carePlan?.title || 'Untitled Care Plan'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Family: {assignment.carePlan?.familyProfile?.fullName || 'Unknown'}
                                </p>
                                {assignment.carePlan?.familyProfile?.phoneNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    {assignment.carePlan.familyProfile.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {assignment.carePlan?.description || 'No description available'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge 
                              variant={assignment.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {assignment.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {assignment.role}
                            </Badge>
                            <Link to={`/professional/assignment/${assignment.carePlanId}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Section */}
          {selectedCarePlanId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Schedule
                  {selectedCarePlan && (
                    <Badge variant="outline" className="ml-2">
                      {selectedCarePlan.carePlan?.title}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your upcoming shifts and care plan schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfessionalScheduleView 
                  carePlanId={selectedCarePlanId}
                  loading={loading}
                />
              </CardContent>
            </Card>
          )}

          {/* Medication Management Section */}
          {selectedCarePlanId && medications.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Medication Management
                      {selectedCarePlan && (
                        <Badge variant="outline" className="ml-2">
                          {selectedCarePlan.carePlan?.title}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Manage medications for your assigned care plan
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Medications</p>
                        <p className="text-2xl font-bold">{medications.length}</p>
                      </div>
                      <Pill className="h-8 w-8 text-blue-500" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Upcoming (2h)</p>
                        <p className="text-2xl font-bold text-orange-600">{upcomingMeds.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-500" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                        <p className="text-2xl font-bold text-red-600">{overdueMeds.length}</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </CardContent>
                  </Card>
                </div>

                {/* Medication Tabs */}
                <Tabs defaultValue="urgent" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="urgent" className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Urgent ({overdueMeds.length + upcomingMeds.length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      All Medications ({medications.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="urgent" className="space-y-4 mt-6">
                    {overdueMeds.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <h3 className="text-lg font-medium text-red-700">Overdue Medications</h3>
                        </div>
                        {overdueMeds.map((medication) => (
                          <MedicationCard
                            key={medication.id}
                            medication={medication}
                            onAdminister={() => handleQuickAdminister(medication)}
                            showAdminActions={true}
                            userRole="professional"
                          />
                        ))}
                      </div>
                    )}

                    {upcomingMeds.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <h3 className="text-lg font-medium text-orange-700">Upcoming Medications (Next 2 Hours)</h3>
                        </div>
                        {upcomingMeds.map((medication) => (
                          <MedicationCard
                            key={medication.id}
                            medication={medication}
                            onAdminister={() => handleQuickAdminister(medication)}
                            showAdminActions={true}
                            userRole="professional"
                          />
                        ))}
                      </div>
                    )}

                    {overdueMeds.length === 0 && upcomingMeds.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                        <p className="text-muted-foreground">
                          No urgent medication administrations at this time.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="space-y-4 mt-6">
                    {medications.map((medication) => (
                      <MedicationCard
                        key={medication.id}
                        medication={medication}
                        onAdminister={() => handleQuickAdminister(medication)}
                        showAdminActions={true}
                        userRole="professional"
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Work Logs</h3>
                    <p className="text-sm text-muted-foreground">Log your hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Training</h3>
                    <p className="text-sm text-muted-foreground">Continue learning</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Community</h3>
                    <p className="text-sm text-muted-foreground">Connect with peers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Quick Administration Form */}
      {selectedMedication && (
        <QuickAdministrationForm
          medication={selectedMedication}
          isOpen={showAdminForm}
          onClose={() => {
            setShowAdminForm(false);
            setSelectedMedication(null);
          }}
          onSuccess={handleAdministrationSuccess}
        />
      )}
    </div>
  );
};

export default ProfessionalProfileHub;
