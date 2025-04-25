
import React, { useState, useEffect } from 'react';
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarePlansList } from "@/components/professional/CarePlansList";
import { ProfessionalCalendar } from "@/components/professional/ProfessionalCalendar";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";

interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  care_plan_title?: string;
  care_recipient_name?: string;
}

const ProfessionalProfileHub = () => {
  const [activeTab, setActiveTab] = useState("care-plans");
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | { from?: Date; to?: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  useEffect(() => {
    if (user && activeTab === "schedule") {
      fetchShifts();
    }
  }, [user, activeTab, dateRange]);

  const fetchShifts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('care_shifts')
        .select(`
          id,
          title,
          start_time,
          end_time,
          care_plans:care_plan_id (title),
          care_recipient:care_recipient_id (name)
        `)
        .eq('caregiver_id', user.id)
        .gte('start_time', dateRange.from ? dateRange.from.toISOString() : '')
        .lte('end_time', dateRange.to ? dateRange.to.toISOString() : '');
      
      if (error) {
        console.error("Error fetching shifts:", error);
        return;
      }

      const formattedShifts = data.map(shift => ({
        id: shift.id,
        title: shift.title,
        start_time: shift.start_time,
        end_time: shift.end_time,
        care_plan_title: shift.care_plans?.title || 'Unknown Plan',
        care_recipient_name: shift.care_recipient?.name || 'Unknown Patient',
      }));
      
      setShifts(formattedShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="professional_profile_hub_view" 
        additionalData={{ user_id: user?.id }} 
      />
      
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Professional Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your care plans, schedule, and payment information.
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="care-plans">My Care Plans</TabsTrigger>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="payroll">My Hours & Pay</TabsTrigger>
          </TabsList>
          
          <TabsContent value="care-plans">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>My Assigned Care Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  These are the care plans you are currently assigned to.
                </p>
                <CarePlansList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <CardTitle>My Schedule</CardTitle>
                  <div className="mt-4 md:mt-0">
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  View and manage your upcoming shifts across all care plans.
                </p>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ProfessionalCalendar shifts={shifts} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>My Hours & Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  View your work hours and payment information.
                </p>
                <div className="text-center py-12">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-muted-foreground">
                    Consolidated payroll information across all care plans will be available here soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default ProfessionalProfileHub;
