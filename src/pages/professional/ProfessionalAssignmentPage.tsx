
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, FileText, ArrowLeft, Phone, Mail, MapPin, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const ProfessionalAssignmentPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [careShifts, setCareShifts] = useState<any[]>([]);
  const [careTeam, setCareTeam] = useState<any[]>([]);
  
  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Profile Hub",
      path: "/professional/profile",
    },
    {
      label: "Assignment Details",
      path: `/professional/assignments/${planId}`,
    },
  ];

  // Get user initials for avatar
  const getInitials = (name?: string): string => {
    if (!name) return "";
    
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  useEffect(() => {
    if (!user) {
      toast.info("Authentication Required", {
        description: "Please log in to view assignment details.",
      });
      navigate("/auth", { state: { returnPath: `/professional/assignments/${planId}` } });
      return;
    }
    
    const loadAssignmentData = async () => {
      try {
        setLoading(true);
        
        // Get assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            status,
            role,
            notes,
            created_at,
            updated_at,
            care_plan_id,
            caregiver_id,
            family_id
          `)
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .maybeSingle();
          
        if (assignmentError) {
          console.error("Error fetching assignment:", assignmentError);
          throw assignmentError;
        }
        
        if (!assignmentData) {
          toast.error("Assignment not found", {
            description: "You don't have access to this care plan",
          });
          navigate("/professional/profile");
          return;
        }
        
        setAssignment(assignmentData);
        
        // Get care plan details 
        const { data: planData, error: planError } = await supabase
          .from('care_plans')
          .select(`
            id,
            title,
            description,
            status,
            family_id,
            created_at,
            updated_at,
            metadata,
            profiles:profiles!care_plans_family_id_fkey (
              full_name,
              avatar_url,
              phone_number,
              email:auth.users!profiles_id_fkey(email),
              address
            )
          `)
          .eq('id', planId)
          .maybeSingle();
          
        if (planError) {
          console.error("Error fetching care plan:", planError);
          throw planError;
        }
        
        if (!planData) {
          toast.error("Care plan not found");
          navigate("/professional/profile");
          return;
        }
        
        setCarePlan(planData);
        
        // Get care shifts for this plan
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .order('start_time', { ascending: true });
          
        if (shiftsError) {
          console.error("Error fetching care shifts:", shiftsError);
          throw shiftsError;
        }
        
        // Only include upcoming or current shifts
        const now = new Date();
        const upcomingShifts = shiftsData?.filter(shift => 
          new Date(shift.end_time) >= now
        ) || [];
        
        setCareShifts(upcomingShifts);
        
        // Get care team members
        const { data: teamData, error: teamError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            role,
            status,
            caregiver_id,
            profiles:profiles!care_team_members_caregiver_id_fkey (
              full_name,
              avatar_url,
              professional_type
            )
          `)
          .eq('care_plan_id', planId)
          .neq('caregiver_id', user.id);
          
        if (teamError) {
          console.error("Error fetching care team:", teamError);
          throw teamError;
        }
        
        setCareTeam(teamData || []);
        
      } catch (error) {
        console.error("Error loading assignment data:", error);
        toast.error("Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };
    
    loadAssignmentData();
  }, [user, planId, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!carePlan || !assignment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assignment Not Found</h2>
            <p className="text-muted-foreground mb-6">The care plan you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/professional/profile")}>
              Return to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for shift display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-4"
                onClick={() => navigate("/professional/profile")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
              <h1 className="text-3xl font-bold">{carePlan.title}</h1>
              <p className="text-muted-foreground">{carePlan.description}</p>
            </div>
            <div className="flex flex-col items-end">
              <Badge className={`mb-2 ${
                carePlan.status === 'active' ? 'bg-green-100 text-green-800' : 
                carePlan.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                'bg-amber-100 text-amber-800'
              }`}>
                {carePlan.status === 'active' ? 'Active Plan' : 
                 carePlan.status === 'completed' ? 'Completed' : 
                 carePlan.status}
              </Badge>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {assignment.role}
                </Badge>
                <Badge variant="outline" className={`
                  ${assignment.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                    assignment.status === 'invited' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    'bg-gray-50 text-gray-700 border-gray-200'}
                `}>
                  {assignment.status === 'active' ? 'Active' :
                   assignment.status === 'invited' ? 'Invitation Pending' : 
                   assignment.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="schedule" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Care Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Plan Details</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Your Upcoming Shifts
                      </CardTitle>
                      <CardDescription>
                        {careShifts.length > 0 
                          ? `You have ${careShifts.length} upcoming shifts for this care plan`
                          : "No upcoming shifts scheduled yet"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {careShifts.length > 0 ? (
                        <div className="space-y-4">
                          {careShifts.map((shift) => (
                            <div key={shift.id} className="border rounded-md p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{shift.title}</h3>
                                  {shift.description && (
                                    <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                                  )}
                                </div>
                                <Badge className={`
                                  ${shift.status === 'assigned' ? 'bg-green-100 text-green-800' : 
                                    shift.status === 'open' ? 'bg-amber-100 text-amber-800' : 
                                    shift.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'}
                                `}>
                                  {shift.status === 'assigned' ? 'Assigned' :
                                   shift.status === 'open' ? 'Open' :
                                   shift.status === 'cancelled' ? 'Cancelled' :
                                   shift.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span>
                                  {formatDate(shift.start_time)} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                </span>
                              </div>
                              
                              {shift.location && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span>{shift.location}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">No shifts scheduled</h3>
                          <p className="text-gray-500">
                            You don't have any upcoming shifts for this care plan yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="team">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Care Team Members
                      </CardTitle>
                      <CardDescription>
                        Other professionals providing care
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {careTeam.length > 0 ? (
                        <div className="space-y-4">
                          {careTeam.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.profiles?.avatar_url || ''} />
                                  <AvatarFallback className="bg-primary text-white">
                                    {getInitials(member.profiles?.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.profiles?.full_name || "Team Member"}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {member.role}
                                    </Badge>
                                    {member.profiles?.professional_type && (
                                      <span className="text-xs text-gray-500">{member.profiles.professional_type}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge className={`
                                ${member.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  member.status === 'invited' ? 'bg-amber-100 text-amber-800' : 
                                  'bg-gray-100 text-gray-800'}
                              `}>
                                {member.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">No other team members</h3>
                          <p className="text-gray-500">
                            You're the only care professional assigned to this plan
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Care Plan Details
                      </CardTitle>
                      <CardDescription>
                        Information about this care plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Plan Type</h3>
                        <p>{carePlan.metadata?.plan_type === 'scheduled' 
                            ? 'Scheduled Care' 
                            : carePlan.metadata?.plan_type === 'on-demand' 
                            ? 'On-Demand Care'
                            : carePlan.metadata?.plan_type === 'both'
                            ? 'Scheduled & On-Demand Care'
                            : 'Not specified'}</p>
                      </div>
                      
                      {carePlan.metadata?.weekday_coverage && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Weekday Coverage</h3>
                          <p>{carePlan.metadata.weekday_coverage}</p>
                        </div>
                      )}
                      
                      {carePlan.metadata?.weekend_coverage && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Weekend Coverage</h3>
                          <p>{carePlan.metadata.weekend_coverage === 'yes' ? 'Yes' : 'No'}</p>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                        <p>{carePlan.created_at ? formatDate(carePlan.created_at) : 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                        <p>{carePlan.updated_at ? formatDate(carePlan.updated_at) : 'Unknown'}</p>
                      </div>
                      
                      {assignment.notes && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Assignment Notes</h3>
                          <p className="bg-gray-50 p-3 rounded-md border">{assignment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Family Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={carePlan.profiles?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-white text-lg">
                        {getInitials(carePlan.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{carePlan.profiles?.full_name || "Family"}</h3>
                      <p className="text-sm text-gray-500">Primary Contact</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    {carePlan.profiles?.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${carePlan.profiles.phone_number}`} className="text-sm hover:underline">
                          {carePlan.profiles.phone_number}
                        </a>
                      </div>
                    )}
                    
                    {carePlan.profiles?.email?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href={`mailto:${carePlan.profiles.email.email}`} className="text-sm hover:underline">
                          {carePlan.profiles.email.email}
                        </a>
                      </div>
                    )}
                    
                    {carePlan.profiles?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-sm">{carePlan.profiles.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => navigate("/professional/schedule")}>
                    View Full Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAssignmentPage;
