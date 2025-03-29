
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { fetchCareShiftsByCaregiver } from "@/services/care-plan-service";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CareShift } from "@/services/care-plan-service";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { calendar, clock, user, file-text, edit } from "lucide-react";

const ProfessionalSchedulePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredShifts, setFilteredShifts] = useState<CareShift[]>([]);

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
      label: "Schedule",
      path: "/professional/schedule",
    },
  ];

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
        const caregiverShifts = await fetchCareShiftsByCaregiver(user.id);
        console.log("Loaded shifts:", caregiverShifts);
        setShifts(caregiverShifts);
      } catch (error) {
        console.error("Error loading care shifts:", error);
        toast.error("Failed to load your care schedule.");
      } finally {
        setLoading(false);
      }
    };

    loadShifts();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedDate && shifts.length > 0) {
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      const filtered = shifts.filter(shift => {
        const shiftDate = new Date(shift.start_time);
        shiftDate.setHours(0, 0, 0, 0);
        return shiftDate.getTime() === selected.getTime();
      });
      
      setFilteredShifts(filtered);
    } else {
      setFilteredShifts([]);
    }
  }, [selectedDate, shifts]);

  // Function to get dates with shifts for the calendar
  const getDatesWithShifts = () => {
    return shifts.map(shift => new Date(shift.start_time));
  };

  // Organize shifts by date for list view
  const getShiftsByDate = () => {
    const shiftsByDate: Record<string, CareShift[]> = {};
    
    shifts.forEach(shift => {
      const dateStr = format(new Date(shift.start_time), 'yyyy-MM-dd');
      if (!shiftsByDate[dateStr]) {
        shiftsByDate[dateStr] = [];
      }
      shiftsByDate[dateStr].push(shift);
    });
    
    // Sort dates
    return Object.keys(shiftsByDate)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({
        date,
        shifts: shiftsByDate[date]
      }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 mb-6"
        >
          <h1 className="text-3xl font-bold">Professional Schedule</h1>
          <p className="text-muted-foreground">
            View and manage your upcoming care assignments
          </p>
        </motion.div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Calendar View</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>List View</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Select Date</CardTitle>
                  <CardDescription>
                    View your scheduled shifts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="mx-auto"
                      disabled={{ before: new Date() }}
                      modifiers={{
                        withShifts: getDatesWithShifts()
                      }}
                      modifiersClassNames={{
                        withShifts: "bg-primary-100 font-bold text-primary-700"
                      }}
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate ? (
                      <>Shifts for {format(selectedDate, 'MMMM d, yyyy')}</>
                    ) : (
                      <>Select a date</>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {filteredShifts.length} {filteredShifts.length === 1 ? 'shift' : 'shifts'} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : filteredShifts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredShifts.map((shift) => (
                        <Card key={shift.id} className="overflow-hidden border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium mb-1">{shift.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {shift.description || "No description provided"}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>
                                      {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                                    </span>
                                  </div>
                                  {shift.location && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                      <span>{shift.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge 
                                className={`
                                  ${shift.status === 'assigned' ? 'bg-green-100 text-green-800 border-green-200' : 
                                    shift.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    shift.status === 'completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                    'bg-red-100 text-red-800 border-red-200'}
                                `}
                              >
                                {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
                      <h3 className="mt-4 text-lg font-medium">No shifts scheduled</h3>
                      <p className="mt-1 text-gray-500">
                        You have no care shifts scheduled for this date.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
                      <h3 className="mt-4 text-lg font-medium">Select a date</h3>
                      <p className="mt-1 text-gray-500">
                        Choose a date from the calendar to view scheduled shifts.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Shifts</CardTitle>
                <CardDescription>
                  All of your scheduled care assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : shifts.length > 0 ? (
                  <div className="space-y-8">
                    {getShiftsByDate().map(({ date, shifts }) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </h3>
                        </div>
                        <div className="space-y-3 pl-7">
                          {shifts.map((shift) => (
                            <Card key={shift.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium mb-1">{shift.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {shift.description || "No description provided"}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                        <span>
                                          {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                                        </span>
                                      </div>
                                      {shift.location && (
                                        <div className="flex items-center text-sm text-gray-600">
                                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                          <span>{shift.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`
                                      ${shift.status === 'assigned' ? 'bg-green-100 text-green-800 border-green-200' : 
                                        shift.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        shift.status === 'completed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                        'bg-red-100 text-red-800 border-red-200'}
                                    `}
                                  >
                                    {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium">No upcoming shifts</h3>
                    <p className="mt-1 text-gray-500">
                      You don't have any care shifts scheduled yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalSchedulePage;
