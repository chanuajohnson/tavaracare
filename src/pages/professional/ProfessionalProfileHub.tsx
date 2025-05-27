import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Award, 
  Briefcase,
  Settings,
  Users,
  BookOpen,
  Heart,
  ChevronRight,
  Building,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CareAssignmentCard } from "@/components/professional/care-assignment";
import { CareTeamMembersTab } from "@/components/professional/CareTeamMembersTab";
import { ShiftsTab } from "@/components/professional/assignments/ShiftsTab";
import { CareDetailsTab } from "@/components/professional/assignments/CareDetailsTab";
import { FamilyDetailsCard } from "@/components/professional/assignments/FamilyDetailsCard";
import { ProfessionalScheduleView } from "@/components/professional/ProfessionalScheduleView";

interface CareAssignment {
  id: string;
  care_plan_id: string;
  family_id: string;
  role: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  care_plan?: {
    id: string;
    title: string;
    description: string;
    family_profile?: {
      full_name: string;
      location: string;
      contact_phone: string;
      contact_email: string;
    };
  };
  care_plans?: {
    id: string;
    title: string;
    description: string;
    profiles?: {
      full_name: string;
      location: string;
      contact_phone: string;
      contact_email: string;
    };
  };
  family?: {
    full_name: string;
    location: string;
    contact_phone: string;
    contact_email: string;
  };
}

const ProfessionalProfileHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [profile, setProfile] = useState<any>(null);
  const [careAssignments, setCareAssignments] = useState<CareAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<CareAssignment | null>(null);
  const [selectedCarePlanId, setSelectedCarePlanId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Fetch care assignments
  useEffect(() => {
    if (!user) return;
    
    const fetchCareAssignments = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching care assignments for user:", user.id);
        
        const { data, error } = await supabase
          .from('care_team_members')
          .select(`
            id,
            care_plan_id,
            family_id,
            role,
            status,
            start_date,
            end_date,
            notes,
            created_at,
            updated_at,
            care_plan:care_plans!care_team_members_care_plan_id_fkey(
              id,
              title,
              description,
              family_profile:profiles!care_plans_family_id_fkey(
                full_name,
                location,
                contact_phone,
                contact_email
              )
            ),
            care_plans:care_plans!care_team_members_care_plan_id_fkey(
              id,
              title,
              description,
              profiles:profiles!care_plans_family_id_fkey(
                full_name,
                location,
                contact_phone,
                contact_email
              )
            )
          `)
          .eq('caregiver_id', user.id)
          .eq('status', 'active');
          
        if (error) throw error;
        
        console.log("Raw care assignments data:", data);
        
        // Transform the data to provide both formats for compatibility
        const transformedAssignments = (data || []).map((assignment: any) => {
          const familyProfile = 
            (assignment.care_plan?.family_profile) || 
            (assignment.care_plans?.profiles);
            
          return {
            ...assignment,
            care_plan: assignment.care_plan ? {
              ...assignment.care_plan,
              family_profile: familyProfile
            } : undefined,
            care_plans: assignment.care_plans ? {
              ...assignment.care_plans,
              profiles: familyProfile
            } : undefined,
            family: familyProfile
          };
        });
        
        console.log("Transformed care assignments:", transformedAssignments);
        setCareAssignments(transformedAssignments);
        
        // Set first assignment as selected by default
        if (transformedAssignments.length > 0) {
          setSelectedAssignment(transformedAssignments[0]);
        }
        
      } catch (err: any) {
        console.error("Error fetching care assignments:", err);
        setError(err.message);
        toast.error("Failed to load care assignments");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCareAssignments();
  }, [user]);

  // Extract care plan IDs from assignments for calendar selection
  const availableCarePlans = useMemo(() => {
    if (!careAssignments.length) return [];
    
    return careAssignments.map(assignment => {
      const carePlanData = assignment.care_plan || assignment.care_plans;
      const familyProfile = 
        (assignment.care_plan?.family_profile) || 
        (assignment.care_plans?.profiles) || 
        assignment.family;
      
      return {
        id: assignment.care_plan_id,
        familyName: familyProfile?.full_name || 'Unknown Family',
        carePlanTitle: carePlanData?.title || `Care Plan ${assignment.care_plan_id?.substring(0, 8)}`
      };
    }).filter((plan, index, self) => 
      // Remove duplicates based on care plan ID
      index === self.findIndex(p => p.id === plan.id)
    );
  }, [careAssignments]);

  // Set default selected care plan when available care plans change
  useEffect(() => {
    if (availableCarePlans.length > 0 && !selectedCarePlanId) {
      setSelectedCarePlanId(availableCarePlans[0].id);
      console.log("Setting default care plan ID:", availableCarePlans[0].id);
    }
  }, [availableCarePlans, selectedCarePlanId]);

  // Helper functions
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'Invalid time';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your professional profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumbs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/dashboard/professional" className="text-gray-500 hover:text-gray-700">
              Professional Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Profile Hub</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {getInitials(profile?.full_name || 'Professional')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile?.full_name || 'Professional Profile'}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profile?.professional_type || 'Healthcare Professional'}
                    </span>
                    {profile?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </span>
                    )}
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  
                  {profile?.bio && (
                    <p className="text-gray-600 mb-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {profile?.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {profile.contact_email}
                      </span>
                    )}
                    {profile?.contact_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {profile.contact_phone}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{careAssignments.length}</div>
                    <div className="text-sm text-gray-600">Active Plans</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">4.8</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Experience</span>
                    <span className="text-sm text-gray-600">
                      {profile?.years_experience || 'Not specified'} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Specialties</span>
                    <span className="text-sm text-gray-600">
                      {profile?.specialties?.length || 0} areas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Certifications</span>
                    <span className="text-sm text-gray-600">
                      {profile?.certifications?.length || 0} active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Message Families
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Work Logs
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Training Resources
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Shift completed</div>
                      <div className="text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Work log submitted</div>
                      <div className="text-gray-500">1 day ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <Users className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Team meeting attended</div>
                      <div className="text-gray-500">3 days ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle & Right Columns - Care Assignments & Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Care Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Active Care Assignments
                  <Badge variant="secondary">{careAssignments.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Your current care plan assignments and responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {careAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {careAssignments.map((assignment) => (
                      <CareAssignmentCard 
                        key={assignment.id} 
                        assignment={assignment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Assignments</h3>
                    <p className="text-gray-500 mb-4">You don't have any active care assignments yet.</p>
                    <Button variant="outline">
                      Browse Available Opportunities
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Schedule with Care Plan Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Schedule
                    </CardTitle>
                    <CardDescription>
                      View your shifts and schedule for the selected care plan
                    </CardDescription>
                  </div>
                  {availableCarePlans.length > 1 && (
                    <div className="w-64">
                      <Select value={selectedCarePlanId || ""} onValueChange={setSelectedCarePlanId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select care plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCarePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.familyName} - {plan.carePlanTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ProfessionalScheduleView 
                  carePlanId={selectedCarePlanId}
                  loading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Assignment Details Tabs */}
            {selectedAssignment && (
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                  <CardDescription>
                    Detailed information for your selected care assignment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="team" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="team">Care Team</TabsTrigger>
                      <TabsTrigger value="shifts">Shifts</TabsTrigger>
                      <TabsTrigger value="details">Care Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="team" className="mt-6">
                      <CareTeamMembersTab 
                        teamMembers={[]} 
                        loading={false}
                        currentUserId={user?.id}
                      />
                    </TabsContent>
                    
                    <TabsContent value="shifts" className="mt-6">
                      <ShiftsTab />
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-6">
                      <CareDetailsTab />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileHub;
