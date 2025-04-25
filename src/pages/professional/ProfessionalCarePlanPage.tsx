
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { WorkLogsTable } from "@/components/care-plan/payroll/WorkLogsTable";
import { PayrollFilters } from "@/components/care-plan/payroll/PayrollFilters";
import { usePayrollData } from '@/hooks/payroll/usePayrollData';
import { usePayrollFilters } from '@/hooks/payroll/usePayrollFilters';
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Users, Clock } from "lucide-react";

interface CarePlan {
  id: string;
  title: string;
  description: string;
  status: string;
  family_id: string;
  family_name: string;
}

interface CareTeamMember {
  id: string;
  display_name: string;
  role: string;
}

interface CareShift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  caregiver_name: string;
}

const ProfessionalCarePlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  const {
    workLogs,
    payrollEntries,
    loading: payrollLoading,
  } = usePayrollData(id || '');

  // Set up filters for professional's own work logs
  const {
    filters: workLogFilters,
    setFilters: workLogSetFilters,
    filterItems: filterWorkLogs
  } = usePayrollFilters(workLogs, (log, startDate) => {
    return new Date(log.start_time) >= startDate;
  });

  // Filter only this professional's work logs
  const myWorkLogs = workLogs.filter(log => log.care_team_member_id === user?.id);
  const filteredWorkLogs = filterWorkLogs(myWorkLogs);

  // Check if the professional is authorized to view this care plan
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user || !id) {
        setAuthorized(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('care_team_members')
          .select('id')
          .eq('care_plan_id', id)
          .eq('caregiver_id', user.id)
          .single();
        
        setAuthorized(!!data && !error);
      } catch (error) {
        console.error("Authorization check failed:", error);
        setAuthorized(false);
      }
    };
    
    checkAuthorization();
  }, [id, user]);

  // Load care plan data
  useEffect(() => {
    if (!id || !authorized) return;
    
    const fetchCarePlanDetails = async () => {
      setLoading(true);
      try {
        // Get care plan details
        const { data: planData, error: planError } = await supabase
          .from('care_plans')
          .select(`
            id, 
            title, 
            description, 
            status,
            family_id,
            profiles:family_id (full_name)
          `)
          .eq('id', id)
          .single();
        
        if (planError || !planData) throw planError;
        
        setCarePlan({
          id: planData.id,
          title: planData.title,
          description: planData.description,
          status: planData.status,
          family_id: planData.family_id,
          family_name: planData.profiles?.full_name || 'Unknown Family'
        });
        
        // Get care team members
        const { data: teamData, error: teamError } = await supabase
          .from('care_team_members')
          .select(`
            id,
            display_name,
            role
          `)
          .eq('care_plan_id', id);
        
        if (teamError) throw teamError;
        setCareTeam(teamData || []);
        
        // Get upcoming shifts
        const now = new Date();
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('care_shifts')
          .select(`
            id,
            title,
            start_time,
            end_time,
            caregiver_id,
            care_team_members:caregiver_id (display_name)
          `)
          .eq('care_plan_id', id)
          .gt('start_time', now.toISOString())
          .order('start_time', { ascending: true })
          .limit(5);
        
        if (shiftsError) throw shiftsError;
        
        setUpcomingShifts((shiftsData || []).map(shift => ({
          id: shift.id,
          title: shift.title,
          start_time: shift.start_time,
          end_time: shift.end_time,
          caregiver_name: shift.care_team_members?.display_name || 'Unknown'
        })));
      } catch (error) {
        console.error("Error fetching care plan details:", error);
        navigate("/professional/profile-hub");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarePlanDetails();
  }, [id, authorized, navigate]);

  if (!authorized) {
    return (
      <Container className="py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
            <p className="text-center text-muted-foreground mb-6">
              You are not authorized to view this care plan.
            </p>
            <Link to="/professional/profile-hub">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-12">
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Container>
    );
  }

  if (!carePlan) {
    return (
      <Container className="py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-4">Care Plan Not Found</h2>
            <p className="text-center text-muted-foreground mb-6">
              The requested care plan could not be found.
            </p>
            <Link to="/professional/profile-hub">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="professional_care_plan_view" 
        additionalData={{ plan_id: id }} 
      />
      
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/professional/profile-hub")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile Hub
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{carePlan.title}</h1>
              <p className="text-muted-foreground mt-1">
                Family: {carePlan.family_name}
              </p>
            </div>
            
            <Badge className={`${
              carePlan.status === 'active' ? 'bg-green-100 text-green-800' :
              carePlan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="payroll">My Hours & Pay</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Care Plan Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{carePlan.description || 'No description provided'}</p>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Care Team</h3>
                    <div className="space-y-2">
                      {careTeam.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center">
                            <div className="bg-primary/10 rounded-full p-2 mr-3">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <span>{member.display_name || 'Unknown'}</span>
                          </div>
                          <Badge variant="outline">{member.role || 'Member'}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Shifts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingShifts.length === 0 ? (
                    <p className="text-muted-foreground">No upcoming shifts scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingShifts.map(shift => {
                        const startDate = new Date(shift.start_time);
                        const endDate = new Date(shift.end_time);
                        
                        return (
                          <div key={shift.id} className="p-3 border rounded-md">
                            <h4 className="font-medium">{shift.title}</h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Caregiver: {shift.caregiver_name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => navigate(`/professional/schedule`)}
                  >
                    View Full Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>My Schedule for this Care Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  View your upcoming shifts for this care plan.
                </p>
                
                {/* Placeholder for schedule - this would be implemented with a calendar component */}
                <div className="border rounded-md p-6 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Schedule View</h3>
                  <p className="text-sm text-muted-foreground">
                    The detailed schedule view will be implemented here with your assigned shifts for this care plan.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate(`/professional/schedule`)}
                  >
                    View Full Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>My Hours & Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <PayrollFilters
                    searchTerm={workLogFilters.searchTerm}
                    onSearchChange={workLogSetFilters.setSearchTerm}
                    dateRangeFilter={workLogFilters.dateRangeFilter}
                    onDateRangeChange={workLogSetFilters.setDateRangeFilter}
                    statusFilter={workLogFilters.statusFilter}
                    onStatusChange={workLogSetFilters.setStatusFilter}
                    onQuickDateRangeSelect={workLogSetFilters.setDateRangeFilter}
                  />
                </div>
                
                {payrollLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium mb-4">My Work Logs</h3>
                    {filteredWorkLogs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No work logs found for the selected filters.</p>
                      </div>
                    ) : (
                      <WorkLogsTable
                        workLogs={filteredWorkLogs}
                        onApprove={() => {}}
                        onReject={() => Promise.resolve(false)}
                        readOnly={true}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default ProfessionalCarePlanPage;
