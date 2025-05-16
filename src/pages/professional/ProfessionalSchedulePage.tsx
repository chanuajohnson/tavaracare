import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Clock, MapPin, ArrowLeft, Users, ClipboardList, FileText } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";

const ProfessionalSchedulePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<any[]>([]);
  const [careAssignments, setCareAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('day');
  
  // Journey tracking
  useJourneyTracking({
    journeyStage: 'schedule_management',
    additionalData: { page: 'professional_schedule' },
    trackOnce: true
  });
  
  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Schedule",
      path: "/professional/schedule",
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
  
  // Load care assignments for the professional
  useEffect(() => {
    if (!user) return;
    
    const loadCareAssignments = async () => {
      try {
        setLoadingAssignments(true);
        
        // Get care team assignments where the professional is a member
        const { data: teamMemberships, error: teamError } = await supabase
          .from('care_team_members')
          .select(`
            id, 
            status,
            role,
            care_plan_id,
            family_id,
            care_plans:care_plans(
              id,
              title,
              description,
              status,
              profiles:profiles!care_plans_family_id_fkey(
                id,
                full_name,
                avatar_url
              )
            )
          `)
          .eq('caregiver_id', user.id)
          .order('created_at', { ascending: false });
          
        if (teamError) {
          console.error("Error fetching care assignments:", teamError);
          throw teamError;
        }
        
        console.log("Care assignments loaded:", teamMemberships);
        setCareAssignments(teamMemberships || []);
      } catch (error) {
        console.error("Failed to load care assignments:", error);
        toast.error("Failed to load your care assignments");
      } finally {
        setLoadingAssignments(false);
      }
    };
    
    loadCareAssignments();
  }, [user]);
  
  useEffect(() => {
    if (!user) {
      toast.info("Authentication Required", {
        description: "Please log in to view your schedule.",
      });
      navigate("/auth", { state: { returnPath: "/professional/schedule" } });
      return;
    }
    
    const loadShifts = async () => {
      try {
        setLoading(true);
        
        let startDate, endDate;
        
        if (currentView === 'day' && selectedDate) {
          // For day view, get shifts for the selected day only
          startDate = new Date(selectedDate);
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(selectedDate);
          endDate.setHours(23, 59, 59, 999);
        } else if (currentView === 'week' && selectedDate) {
          // For week view, get shifts for the entire week
          startDate = new Date(selectedDate);
          const day = startDate.getDay();
          const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
          startDate = new Date(startDate.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else if (currentView === 'month' && selectedDate) {
          // For month view, get shifts for the entire month
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else {
          // Default to current day if no date is selected
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
        }
        
        // Get all shifts for the caregiver within the date range
        const { data, error } = await supabase
          .from('care_shifts')
          .select(`
            id,
            title,
            description,
            location,
            status,
            start_time,
            end_time,
            care_plan_id,
            family_id,
            care_plans:care_plans(
              id,
              title,
              status,
              profiles:profiles!care_plans_family_id_fkey(
                full_name,
                avatar_url
              )
            )
          `)
          .eq('caregiver_id', user.id)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .order('start_time', { ascending: true });
        
        if (error) {
          console.error("Error fetching shifts:", error);
          throw error;
        }
        
        console.log("Loaded shifts:", data);
        setShifts(data || []);
        
      } catch (error) {
        console.error("Failed to load shifts:", error);
        toast.error("Failed to load your schedule");
      } finally {
        setLoading(false);
      }
    };
    
    loadShifts();
  }, [user, navigate, selectedDate, currentView]);
  
  // Fix for the map error - Convert to correct type
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
  
  // Group shifts by date for easier display
  const groupedShifts: Record<string, any[]> = shifts.reduce((acc: Record<string, any[]>, shift) => {
    const dateKey = new Date(shift.start_time).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(shift);
    return acc;
  }, {});
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={() => navigate("/dashboard/professional")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Your Schedule</h1>
            <p className="text-muted-foreground">Manage your care assignments and shifts</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={currentView === 'day' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCurrentView('day')}
            >
              Day
            </Button>
            <Button 
              variant={currentView === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCurrentView('week')}
            >
              Week
            </Button>
            <Button 
              variant={currentView === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCurrentView('month')}
            >
              Month
            </Button>
          </div>
        </div>
        
        {/* Care Assignments Section */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Your Care Assignments
              </CardTitle>
              <CardDescription>
                Families and care plans you are assigned to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAssignments ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : careAssignments.length > 0 ? (
                <div className="space-y-4">
                  {careAssignments.map((assignment) => (
                    <div 
                      key={assignment.id} 
                      className="border rounded-md p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={assignment.care_plans?.profiles?.avatar_url || ''} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(assignment.care_plans?.profiles?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-lg">{assignment.care_plans?.title || 'Unnamed Plan'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {assignment.care_plans?.profiles?.full_name || 'Family'}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            assignment.status === 'active' ? 'bg-green-100 text-green-800' : 
                            assignment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {assignment.status || 'Unknown'}
                        </Badge>
                      </div>
                      {assignment.care_plans?.description && (
                        <p className="text-sm mt-2 text-gray-600">{assignment.care_plans.description}</p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Link to={`/professional/assignments/${assignment.care_plan_id}`}>
                          <Button size="sm" variant="default">
                            View Plan Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No care assignments yet</h3>
                  <p className="text-gray-500 mb-6">
                    You'll see care plans here once families assign you to their care team
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {currentView === 'day' && selectedDate
                      ? `Schedule for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                      : currentView === 'week' && selectedDate
                      ? 'Weekly Schedule'
                      : 'Monthly Schedule'}
                  </CardTitle>
                  <CardDescription>
                    {shifts.length 
                      ? `You have ${shifts.length} shift${shifts.length === 1 ? '' : 's'} scheduled`
                      : 'No shifts scheduled for this period'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(groupedShifts).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupedShifts).map(([dateKey, dayShifts]) => (
                        <div key={dateKey} className="space-y-3">
                          <h3 className="font-medium text-gray-700">
                            {new Date(dateKey).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </h3>
                          <div className="space-y-3">
                            {dayShifts.map((shift) => (
                              <div key={shift.id} className="border rounded-md p-4 space-y-3 bg-card hover:shadow-sm transition-shadow">
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
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>
                                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                  </span>
                                </div>
                                
                                {shift.location && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>{shift.location}</span>
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center pt-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={shift.care_plans?.profiles?.avatar_url || ''} />
                                      <AvatarFallback className="bg-primary text-white text-xs">
                                        {getInitials(shift.care_plans?.profiles?.full_name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{shift.care_plans?.profiles?.full_name || "Family"}</span>
                                  </div>
                                  
                                  <Link to={`/professional/assignments/${shift.care_plan_id}`}>
                                    <Button variant="default" size="sm">
                                      View Plan
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">No shifts scheduled</h3>
                      <p className="text-gray-500 mb-6">
                        You don't have any shifts scheduled for this time period
                      </p>
                      <Button variant="outline" onClick={() => navigate("/dashboard/professional")}>
                        Back to Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border shadow-sm"
                />
                
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-sm text-gray-700">Quick Links</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      onClick={() => navigate("/dashboard/professional")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Link to="/professional/profile">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Profile Hub
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {!loading && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Schedule Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Today</span>
                      <span className="font-medium">{
                        shifts.filter(s => 
                          new Date(s.start_time).toDateString() === new Date().toDateString()
                        ).length
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-medium">{
                        shifts.filter(s => {
                          const shiftDate = new Date(s.start_time);
                          const now = new Date();
                          const startOfWeek = new Date(now);
                          const day = startOfWeek.getDay();
                          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                          startOfWeek.setDate(diff);
                          startOfWeek.setHours(0, 0, 0, 0);
                          
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(endOfWeek.getDate() + 6);
                          endOfWeek.setHours(23, 59, 59, 999);
                          
                          return shiftDate >= startOfWeek && shiftDate <= endOfWeek;
                        }).length
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Assignments</span>
                      <span className="font-medium">{careAssignments.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSchedulePage;
