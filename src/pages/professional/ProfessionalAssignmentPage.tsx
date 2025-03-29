
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Calendar, ClipboardList, Phone, Mail, MapPin, AlarmClock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";

const ProfessionalAssignmentPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carePlan, setCarePlan] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  // Journey tracking
  useJourneyTracking({
    journeyStage: 'assignment_management',
    additionalData: { page: 'professional_assignment', plan_id: planId },
    trackOnce: true
  });

  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Profile",
      path: "/professional/profile",
    },
    {
      label: "Assignment Details",
      path: `/professional/assignments/${planId}`,
    },
  ];

  useEffect(() => {
    if (!user) {
      toast.info("Authentication Required", {
        description: "Please log in to view assignment details.",
      });
      navigate("/auth", { state: { returnPath: `/professional/assignments/${planId}` } });
      return;
    }

    const loadCarePlan = async () => {
      try {
        setLoading(true);

        // First, check if this caregiver is actually assigned to this care plan
        const { data: memberCheck, error: memberCheckError } = await supabase
          .from('care_team_members')
          .select('id')
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .maybeSingle();

        if (memberCheckError) throw memberCheckError;

        if (!memberCheck) {
          toast.error("Unauthorized Access", {
            description: "You are not authorized to view this care plan.",
          });
          navigate("/professional/profile");
          return;
        }

        // Fetch care plan details
        const { data: planData, error: planError } = await supabase
          .from('care_plans')
          .select(`
            id,
            title,
            description,
            status,
            family_id,
            created_at,
            metadata,
            profiles:family_id (
              full_name,
              phone_number,
              email,
              address,
              avatar_url
            )
          `)
          .eq('id', planId)
          .maybeSingle();

        if (planError) throw planError;
        if (!planData) {
          toast.error("Care Plan Not Found", {
            description: "The requested care plan could not be found.",
          });
          navigate("/professional/profile");
          return;
        }

        setCarePlan(planData);

        // Fetch team members for this care plan
        const { data: teamData, error: teamError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            status,
            role,
            caregiver_id,
            profiles:caregiver_id (
              full_name,
              professional_type,
              avatar_url
            )
          `)
          .eq('care_plan_id', planId);

        if (teamError) throw teamError;
        setTeamMembers(teamData || []);

        // Fetch upcoming shifts for this care plan
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .eq('care_plan_id', planId)
          .eq('caregiver_id', user.id)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);

        if (shiftsError) throw shiftsError;
        setShifts(shiftsData || []);

        setLoading(false);
      } catch (error) {
        console.error("Error loading care plan:", error);
        toast.error("Failed to load assignment details");
        setLoading(false);
      }
    };

    loadCarePlan();
  }, [user, planId, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8">
          <DashboardHeader breadcrumbItems={breadcrumbItems} />
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            onClick={() => navigate("/professional/profile")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          <Skeleton className="h-12 w-2/3 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
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

        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/professional/profile")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{carePlan?.title}</h1>
            <p className="text-muted-foreground">Care plan assignment details</p>
          </div>

          <Badge
            className={`
              ${carePlan?.status === 'active' ? 'bg-green-100 text-green-800' :
                carePlan?.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  carePlan?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}
              px-3 py-1
            `}
          >
            {carePlan?.status?.charAt(0).toUpperCase() + carePlan?.status?.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Family Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <div className="font-medium text-lg">{carePlan?.profiles?.full_name}</div>
                  <div className="text-muted-foreground text-sm">Family Member</div>
                </div>

                <div className="space-y-3">
                  {carePlan?.profiles?.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{carePlan.profiles.phone_number}</span>
                    </div>
                  )}

                  {carePlan?.profiles?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{carePlan.profiles.email}</span>
                    </div>
                  )}

                  {carePlan?.profiles?.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{carePlan.profiles.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/professional/schedule")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="details" className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span>Care Details</span>
                </TabsTrigger>
                <TabsTrigger value="shifts" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming Shifts</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Care Team</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Care Plan Details</CardTitle>
                    <CardDescription>
                      Created on {formatDate(carePlan?.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {carePlan?.description ? (
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-gray-600">{carePlan.description}</p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No detailed description available</p>
                      </div>
                    )}

                    {carePlan?.metadata && (
                      <div>
                        <h3 className="font-medium mb-2">Care Requirements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(carePlan.metadata).map(([key, value]) => (
                            <div key={key} className="border rounded-md p-3 bg-gray-50">
                              <p className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="text-sm text-gray-600">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shifts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Shifts</CardTitle>
                    <CardDescription>
                      Your scheduled care sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {shifts.length > 0 ? (
                      <div className="space-y-4">
                        {shifts.map((shift) => (
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
                              <AlarmClock className="h-4 w-4 text-gray-500" />
                              <span>
                                {formatDate(shift.start_time)}, {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
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
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No upcoming shifts</h3>
                        <p className="text-gray-500 mb-6">
                          You don't have any shifts scheduled for this care plan yet
                        </p>
                        <Button variant="outline" onClick={() => navigate("/professional/schedule")}>
                          View Full Schedule
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Care Team Members</CardTitle>
                    <CardDescription>
                      Other professionals involved in this care plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {teamMembers.length > 1 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {teamMembers.filter(member => member.caregiver_id !== user.id).map((member) => (
                          <div key={member.id} className="border rounded-md p-4 flex items-center gap-3">
                            <div className="rounded-full bg-primary-50 p-2">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{member.profiles?.full_name || 'Team Member'}</p>
                              <p className="text-sm text-gray-600">{member.profiles?.professional_type || member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No other team members</h3>
                        <p className="text-gray-500">
                          You're currently the only professional assigned to this care plan
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAssignmentPage;
