import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { 
  ArrowLeft, Calendar, Clock, FileText, Plus, Users, ArrowRight, X, Edit, 
  Trash2, MoreHorizontal, UserMinus, CalendarRange, ChevronDown
} from "lucide-react";
import { 
  fetchCarePlan, 
  fetchCareTeamMembers, 
  inviteCareTeamMember,
  removeCareTeamMember,
  CareTeamMember, 
  CarePlan,
  fetchCareShifts,
  createCareShift,
  updateCareShift,
  deleteCareShift,
  CareShift
} from "@/services/care-plan-service";
import { 
  format, addDays, startOfWeek, parse, isSameDay, parseISO, addWeeks, 
  isWithinInterval, endOfDay, startOfDay, subWeeks
} from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface Professional {
  id: string;
  full_name: string | null;
  professional_type: string | null;
  avatar_url: string | null;
}

interface CareTeamMemberWithProfile extends CareTeamMember {
  professionalDetails?: Professional;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SHIFT_TITLE_OPTIONS = [
  { id: "weekday_standard", label: "Monday - Friday, 8 AM - 4 PM", description: "Standard daytime coverage during business hours", timeRange: { start: "08:00", end: "16:00" } },
  { id: "weekday_extended", label: "Monday - Friday, 6 AM - 6 PM", description: "Extended daytime coverage for more comprehensive care", timeRange: { start: "06:00", end: "18:00" } },
  { id: "weekday_night", label: "Monday - Friday, 6 PM - 8 AM", description: "Extended nighttime coverage to relieve standard daytime coverage", timeRange: { start: "18:00", end: "08:00" } },
  { id: "saturday_sunday", label: "Saturday - Sunday, 6 AM - 6 PM", description: "Daytime weekend coverage with a dedicated caregiver", timeRange: { start: "06:00", end: "18:00" } },
  { id: "weekday_evening_4pm_6am", label: "Weekday Evening Shift (4 PM - 6 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "16:00", end: "06:00" } },
  { id: "weekday_evening_4pm_8am", label: "Weekday Evening Shift (4 PM - 8 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "16:00", end: "08:00" } },
  { id: "weekday_evening_6pm_6am", label: "Weekday Evening Shift (6 PM - 6 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "18:00", end: "06:00" } },
  { id: "weekday_evening_6pm_8am", label: "Weekday Evening Shift (6 PM - 8 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "18:00", end: "08:00" } }
];

const TIME_SLOTS = [
  { label: "Morning (6AM-12PM)", value: "morning", time: { start: "06:00", end: "12:00" } },
  { label: "Afternoon (12PM-6PM)", value: "afternoon", time: { start: "12:00", end: "18:00" } },
  { label: "Evening (6PM-10PM)", value: "evening", time: { start: "18:00", end: "22:00" } },
  { label: "Overnight (10PM-6AM)", value: "overnight", time: { start: "22:00", end: "06:00" } }
];

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [newTeamMember, setNewTeamMember] = useState({
    caregiverId: "",
    role: "caregiver" as const,
    notes: ""
  });
  const [newShift, setNewShift] = useState({
    caregiverId: "",
    title: "",
    selectedShiftType: "",
    description: "",
    day: "",
    timeSlot: "",
    recurring: "no",
    location: ""
  });
  const [editingShift, setEditingShift] = useState<CareShift | null>(null);
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CareTeamMemberWithProfile | null>(null);
  const [isRangeSelection, setIsRangeSelection] = useState(false);

  useEffect(() => {
    if (user && id) {
      loadCarePlan();
      loadCareTeamMembers();
      loadCareShifts();
      loadProfessionals();
    } else {
      setLoading(false);
    }
  }, [user, id]);

  const loadCarePlan = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const plan = await fetchCarePlan(id);
      if (plan) {
        setCarePlan(plan);
      } else {
        toast.error("Care plan not found");
        navigate("/family/care-management");
      }
    } catch (error) {
      console.error("Error loading care plan:", error);
      toast.error("Failed to load care plan details");
    } finally {
      setLoading(false);
    }
  };

  const loadCareTeamMembers = async () => {
    if (!id) return;

    try {
      const members = await fetchCareTeamMembers(id);
      
      const membersWithDetails = await Promise.all(members.map(async (member) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, professional_type, avatar_url')
          .eq('id', member.caregiver_id)
          .single();
        
        return {
          ...member,
          professionalDetails: error ? undefined : data
        };
      }));
      
      setCareTeamMembers(membersWithDetails);
    } catch (error) {
      console.error("Error loading care team members:", error);
      toast.error("Failed to load care team members");
    }
  };

  const loadCareShifts = async () => {
    if (!id) return;

    try {
      const shifts = await fetchCareShifts(id);
      setCareShifts(shifts);
    } catch (error) {
      console.error("Error loading care shifts:", error);
      toast.error("Failed to load care shifts");
    }
  };

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, professional_type, avatar_url')
        .eq('role', 'professional');

      if (error) {
        throw error;
      }

      setProfessionals(data || []);
    } catch (error) {
      console.error("Error loading professionals:", error);
      toast.error("Failed to load available professionals");
    }
  };

  const handleInviteTeamMember = async () => {
    if (!id || !user) return;

    try {
      if (!newTeamMember.caregiverId) {
        toast.error("Please select a professional to assign");
        return;
      }

      await inviteCareTeamMember({
        care_plan_id: id,
        family_id: user.id,
        caregiver_id: newTeamMember.caregiverId,
        role: newTeamMember.role,
        status: 'active',
        notes: newTeamMember.notes
      });

      toast.success("Team member assigned successfully");
      setInviteDialogOpen(false);
      
      setNewTeamMember({
        caregiverId: "",
        role: "caregiver",
        notes: ""
      });
      
      loadCareTeamMembers();
    } catch (error) {
      console.error("Error assigning team member:", error);
      toast.error("Failed to assign team member");
    }
  };

  const handleRemoveTeamMember = async () => {
    if (!memberToRemove) return;

    try {
      const success = await removeCareTeamMember(memberToRemove.id);
      if (success) {
        loadCareTeamMembers();
        toast.success("Team member removed successfully");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    } finally {
      setConfirmRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleCreateShift = async () => {
    if (!id || !user) return;
    
    try {
      const baseDayDate = selectedDay || (dateRange?.from ? new Date(dateRange.from) : new Date());
      
      const selectedShiftType = SHIFT_TITLE_OPTIONS.find(option => option.id === newShift.selectedShiftType);
      
      if (!selectedShiftType) {
        toast.error("Please select a valid shift type");
        return;
      }

      const datesToCreateShifts = [];
      
      if (isRangeSelection && dateRange?.from && dateRange.to) {
        let currentDate = new Date(dateRange.from);
        const endDate = new Date(dateRange.to);
        
        while (currentDate <= endDate) {
          datesToCreateShifts.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        datesToCreateShifts.push(baseDayDate);
      }
      
      for (const shiftDate of datesToCreateShifts) {
        const shiftTitle = selectedShiftType.label;
        
        const [startHour, startMinute] = selectedShiftType.timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = selectedShiftType.timeRange.end.split(':').map(Number);
        
        const startTime = new Date(shiftDate);
        startTime.setHours(startHour, startMinute, 0);
        
        const endTime = new Date(shiftDate);
        if (endHour < startHour) {
          endTime.setDate(endTime.getDate() + 1);
        }
        endTime.setHours(endHour, endMinute, 0);

        const shiftData = {
          care_plan_id: id,
          family_id: user.id,
          caregiver_id: newShift.caregiverId !== "unassigned" ? newShift.caregiverId : undefined,
          title: shiftTitle,
          description: selectedShiftType.description,
          location: "Patient's home",
          status: "open" as "open" | "assigned" | "completed" | "cancelled",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          recurring_pattern: undefined
        };

        if (editingShift && !isRangeSelection) {
          await updateCareShift(editingShift.id, shiftData);
        } else {
          await createCareShift(shiftData);
        }
      }

      toast.success(isRangeSelection ? 
        "Care shifts created for selected date range" : 
        (editingShift ? "Care shift updated" : "Care shift created")
      );
      
      setShiftDialogOpen(false);
      setNewShift({
        caregiverId: "",
        title: "",
        selectedShiftType: "",
        description: "",
        day: "",
        timeSlot: "",
        recurring: "no",
        location: ""
      });
      setEditingShift(null);
      setDateRange({ from: undefined, to: undefined });
      setIsRangeSelection(false);
      loadCareShifts();
    } catch (error) {
      console.error("Error creating/updating care shift:", error);
      toast.error("Failed to save care shift");
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this shift?");
      if (confirmed) {
        await deleteCareShift(shiftId);
        loadCareShifts();
      }
    } catch (error) {
      console.error("Error deleting care shift:", error);
      toast.error("Failed to delete care shift");
    }
  };

  const handleEditShift = (shift: CareShift) => {
    const shiftDate = new Date(shift.start_time);
    
    const matchingShiftType = SHIFT_TITLE_OPTIONS.find(option => 
      option.label === shift.title
    ) || SHIFT_TITLE_OPTIONS[0];
    
    setSelectedDay(shiftDate);
    setNewShift({
      caregiverId: shift.caregiver_id || "",
      title: shift.title,
      selectedShiftType: matchingShiftType.id,
      description: shift.description || "",
      day: format(shiftDate, "yyyy-MM-dd"),
      timeSlot: "",
      recurring: "no",
      location: shift.location || ""
    });
    setEditingShift(shift);
    setIsRangeSelection(false);
    setDateRange({ from: undefined, to: undefined });
    setShiftDialogOpen(true);
  };

  const openNewShiftDialog = (day: Date) => {
    setSelectedDay(day);
    setNewShift({
      ...newShift,
      day: format(day, "yyyy-MM-dd"),
    });
    setEditingShift(null);
    setIsRangeSelection(false);
    setDateRange({ from: undefined, to: undefined });
    setShiftDialogOpen(true);
  };

  const getWeekDays = () => {
    return DAYS_OF_WEEK.map((_, index) => {
      const day = addDays(selectedWeek, index);
      return day;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => {
      return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
    });
  };

  const getShiftsForDay = (day: Date) => {
    return careShifts.filter(shift => {
      const shiftDate = new Date(shift.start_time);
      return isSameDay(shiftDate, day);
    });
  };

  const getCaregiverName = (caregiverId?: string) => {
    if (!caregiverId) return "Unassigned";
    
    const member = careTeamMembers.find(m => m.caregiver_id === caregiverId);
    return member?.professionalDetails?.full_name || "Unknown";
  };

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const getPlanTypeDisplay = (plan: CarePlan) => {
    if (!plan.metadata?.plan_type) return "Not specified";
    
    switch (plan.metadata.plan_type) {
      case 'scheduled':
        return "Scheduled Care";
      case 'on-demand':
        return "On-demand Care";
      case 'both':
        return "Scheduled & On-demand";
      default:
        return "Not specified";
    }
  };

  const getInitials = (name: string | null | undefined, id: string): string => {
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return id.substring(0, 2).toUpperCase();
  };

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
          <CardHeader>
            <CardTitle>Care Plan Not Found</CardTitle>
            <CardDescription>
              The requested care plan could not be found.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/family/care-management")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Management
            </Button>
          </CardFooter>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_care_plan_view" additionalData={{ plan_id: id }} />
      
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/family/care-management")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Care Plans
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{carePlan?.title}</h1>
              <p className="text-muted-foreground mt-1">
                {carePlan?.description || "No description provided"}
              </p>
            </div>
            
            <Badge className={`${
              carePlan?.status === 'active' ? 'bg-green-100 text-green-800' :
              carePlan?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {carePlan?.status.charAt(0).toUpperCase() + carePlan?.status.slice(1)}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="team">Care Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Care Plan Details</CardTitle>
                <CardDescription>
                  Information about this care plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Plan Type</h3>
                    <p className="font-medium">{getPlanTypeDisplay(carePlan)}</p>
                  </div>
                  
                  {carePlan.metadata?.plan_type !== 'on-demand' && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekday Coverage</h3>
                      <p className="font-medium">{carePlan.metadata?.weekday_coverage || "None"}</p>
                    </div>
                  )}
                  
                  {carePlan.metadata?.plan_type !== 'on-demand' && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Weekend Coverage</h3>
                      <p className="font-medium">{carePlan.metadata?.weekend_coverage === 'yes' ? "6AM-6PM" : "None"}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Created On</h3>
                    <p className="font-medium">{new Date(carePlan.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
                    <p className="font-medium">{new Date(carePlan.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {carePlan.metadata?.additional_shifts && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Shifts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {carePlan.metadata.additional_shifts.weekdayEvening4pmTo6am && (
                        <Badge variant="outline" className="justify-start">Weekday Evening (4PM-6AM)</Badge>
                      )}
                      {carePlan.metadata.additional_shifts.weekdayEvening4pmTo8am && (
                        <Badge variant="outline" className="justify-start">Weekday Evening (4PM-8AM)</Badge>
                      )}
                      {carePlan.metadata.additional_shifts.weekdayEvening6pmTo6am && (
                        <Badge variant="outline" className="justify-start">Weekday Evening (6PM-6AM)</Badge>
                      )}
                      {carePlan.metadata.additional_shifts.weekdayEvening6pmTo8am && (
                        <Badge variant="outline" className="justify-start">Weekday Evening (6PM-8AM)</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Care Team Members</h2>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Care Professional</DialogTitle>
                    <DialogDescription>
                      Add a care professional to this care plan. They will be assigned immediately.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="caregiver">Care Professional</Label>
                      <Select 
                        value={newTeamMember.caregiverId} 
                        onValueChange={(value) => setNewTeamMember({...newTeamMember, caregiverId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a professional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.full_name || "Unknown Professional"} 
                              {prof.professional_type ? ` (${prof.professional_type})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={newTeamMember.role} 
                        onValueChange={(value: any) => setNewTeamMember({...newTeamMember, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caregiver">Caregiver</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="therapist">Therapist</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Add any specific notes or instructions for this team member"
                        value={newTeamMember.notes}
                        onChange={(e) => setNewTeamMember({...newTeamMember, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInviteTeamMember}>Assign Professional</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {careTeamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careTeamMembers.map((member) => {
                  const initials = getInitials(member.professionalDetails?.full_name, member.caregiver_id);
                  const displayName = member.professionalDetails?.full_name || member.caregiver_id;
                  const profType = member.professionalDetails?.professional_type;
                  
                  return (
                    <Card key={member.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={member.professionalDetails?.avatar_url || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{displayName}</CardTitle>
                              <CardDescription>
                                {profType ? `${profType} (${member.role})` : 
                                  member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                              member.status === 'declined' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setMemberToRemove(member);
                                    setConfirmRemoveDialogOpen(true);
                                  }}
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove from team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      {member.notes && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{member.notes}</p>
                        </CardContent>
                      )}
                      <CardFooter className="border-t pt-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Added {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  )}
                )}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>No Team Members</CardTitle>
                  <CardDescription>
                    You haven't added any care professionals to this care plan yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add your first team member to start assigning shifts and tasks.</p>
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Team Member
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Care Schedule</CardTitle>
                    <CardDescription>
                      Manage care shifts based on the care plan coverage
                    </CardDescription>
                  </div>
                  {careTeamMembers.length > 0 && (
                    <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Shift
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{editingShift ? 'Edit Shift' : 'Assign shift and team'}</DialogTitle>
                          <DialogDescription>
                            {editingShift 
                              ? 'Update this care shift details and assignment' 
                              : 'Add a new care shift to the schedule'}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Shift Title</Label>
                            <Select 
                              value={newShift.selectedShiftType} 
                              onValueChange={(value) => setNewShift({...newShift, selectedShiftType: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a shift type" />
                              </SelectTrigger>
                              <SelectContent>
                                {SHIFT_TITLE_OPTIONS.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Label>Date Selection</Label>
                            <div className="flex items-center space-x-2">
                              <Button 
                                type="button" 
                                variant={isRangeSelection ? "default" : "outline"} 
                                className="w-1/2"
                                onClick={() => setIsRangeSelection(true)}
                              >
                                <CalendarRange className="mr-2 h-4 w-4" />
                                Date Range
                              </Button>
                              <Button 
                                type="button" 
                                variant={!isRangeSelection ? "default" : "outline"} 
                                className="w-1/2"
                                onClick={() => setIsRangeSelection(false)}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Single Date
                              </Button>
                            </div>
                          </div>

                          {!isRangeSelection ? (
                            <div className="space-y-2">
                              <Label htmlFor="day">Day</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left"
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {selectedDay ? (
                                      format(selectedDay, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={selectedDay || undefined}
                                    onSelect={(date) => {
                                      setSelectedDay(date);
                                      if (date) {
                                        setNewShift({
                                          ...newShift,
                                          day: format(date, "yyyy-MM-dd"),
                                        });
                                      }
                                    }}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>Date Range</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left"
                                  >
                                    <CalendarRange className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                      dateRange.to ? (
                                        <>
                                          {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                                        </>
                                      ) : (
                                        format(dateRange.from, "PPP")
                                      )
                                    ) : (
                                      <span>Pick a date range</span>
                                    )}
                                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="caregiverId">Assign To (Optional)</Label>
                            <Select 
                              value={newShift.caregiverId} 
                              onValueChange={(value) => setNewShift({...newShift, caregiverId: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team member" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {careTeamMembers.map((member) => (
                                  <SelectItem key={member.caregiver_id} value={member.caregiver_id}>
                                    {member.professionalDetails?.full_name || "Unknown Professional"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
                          <Button 
                            onClick={handleCreateShift}
                            disabled={
                              !newShift.selectedShiftType || 
                              (isRangeSelection && (!dateRange?.from || !dateRange.to)) ||
                              (!isRangeSelection && !selectedDay)
                            }
                          >
                            {isRangeSelection 
                              ? 'Create Shifts' 
                              : (editingShift ? 'Update Shift' : 'Create Shift')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {careTeamMembers.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="ml-1">Previous</span>
                      </Button>
                      <h3 className="font-medium">
                        Week of {format(selectedWeek, "MMMM d, yyyy")}
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                        <span className="mr-1">Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays().map((day, index) => (
                        <div key={index} className="text-center font-medium text-xs">
                          {format(day, "EEE")}
                          <br />
                          {format(day, "d")}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays().map((day, index) => {
                        const dayShifts = getShiftsForDay(day);
                        const isWeekend = index === 0 || index === 6;
                        
                        return (
                          <div 
                            key={index} 
                            className={`border rounded-md p-2 min-h-[120px] ${
                              isWeekend ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            {dayShifts.length > 0 ? (
                              <div className="space-y-2">
                                {dayShifts.map(shift => (
                                  <div 
                                    key={shift.id} 
                                    className="text-xs p-1.5 rounded bg-blue-100 border border-blue-200 flex flex-col"
                                  >
                                    <div className="font-medium truncate">{shift.title}</div>
                                    <div className="text-muted-foreground truncate">
                                      {getTimeDisplay(shift.start_time)} - {getTimeDisplay(shift.end_time)}
                                    </div>
                                    <div className={`truncate mt-1 ${
                                      shift.caregiver_id ? 'text-green-700' : 'text-orange-700'
                                    }`}>
                                      {getCaregiverName(shift.caregiver_id)}
                                    </div>
                                    <div className="flex justify-end gap-1 mt-1">
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-6 w-6"
                                        onClick={() => handleEditShift(shift)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteShift(shift.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div 
                                className="flex items-center justify-center h-full cursor-pointer hover:bg-slate-50 transition-colors rounded"
                                onClick={() => openNewShiftDialog(day)}
                              >
                                <Plus className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-muted/30 rounded-md p-4">
                      <h3 className="font-medium mb-2">About the Schedule</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Click on an empty day to add a new shift</li>
                        <li>• You can assign shifts to care team members</li>
                        <li>• Set shifts as recurring for regular schedules</li>
                        <li>• Edit or delete shifts using the icons</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium mb-1">Add team members first</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Before scheduling shifts, you need to add care professionals to your team.
                    </p>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>

      <Dialog open={confirmRemoveDialogOpen} onOpenChange={setConfirmRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.professionalDetails?.full_name || memberToRemove?.caregiver_id} from the care team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setConfirmRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveTeamMember}>
              Remove Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarePlanDetailPage;

