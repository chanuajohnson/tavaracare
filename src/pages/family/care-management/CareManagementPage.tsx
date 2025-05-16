import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { Plus, CalendarRange, Users, Clock, Pill } from "lucide-react";
import { toast } from "sonner";
import { seedPeltierMedications } from "@/utils/medicationSeedData";

const CareManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const breadcrumbItems = [
    { label: "Family Dashboard", path: "/dashboard/family" },
    { label: "Care Management", path: "/family/care-management" },
  ];

  useEffect(() => {
    fetchCarePlans();
  }, [user]);

  const fetchCarePlans = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("care_plans")
        .select("*, care_team_members(count)")
        .eq("family_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setCarePlans(data || []);
      
      // Check if there's a care plan that matches "Peltier" and seed medications if needed
      const peltierPlan = data?.find(plan => 
        plan.title.toLowerCase().includes('peltier') || 
        (plan.description && plan.description.toLowerCase().includes('peltier'))
      );
      
      if (peltierPlan) {
        // Try to seed Ms. Peltier's medications
        seedPeltierMedications(peltierPlan.id);
      }
    } catch (error) {
      console.error("Error fetching care plans:", error);
      toast.error("Failed to load care plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    navigate("/family/care-management/create");
  };

  const handleViewPlan = (planId: string) => {
    navigate(`/family/care-management/${planId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_care_management_view" />
      
      <Container className="py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Care Management</h1>
          <Button onClick={() => navigate("/family/care-management/create")}>
            <Plus className="mr-2 h-4 w-4" />
            New Care Plan
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border border-dashed animate-pulse">
                <CardHeader className="bg-muted/30 h-32"></CardHeader>
                <CardContent className="h-20 pt-6"></CardContent>
              </Card>
            ))
          ) : carePlans.length === 0 ? (
            // Empty state
            <Card className="col-span-full border border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <CalendarRange className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Care Plans Yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Create your first care plan to start managing care schedules, team members, and services.
                </p>
                <Button onClick={() => navigate("/family/care-management/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Care Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Display care plans
            carePlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-8">
                  <CardTitle className="flex justify-between">
                    <span className="truncate">{plan.title}</span>
                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {plan.status || "Active"}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground truncate">
                    {plan.description || "No description"}
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 rounded-full p-1.5 mb-1">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Team</span>
                        <span className="font-medium">{plan.care_team_members?.[0]?.count || 0}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 rounded-full p-1.5 mb-1">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Shifts</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-col items-center">
                        <div className="bg-primary/10 rounded-full p-1.5 mb-1">
                          <Pill className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Meds</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 flex justify-center">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate(`/family/care-management/${plan.id}`)}
                  >
                    Manage Care Plan
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Additional information cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Care Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Care plans help you organize all aspects of care for your loved one,
                including team members, schedules, and health information. Create separate
                plans for different care recipients or care locations.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Assistance?</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-muted-foreground text-sm mb-4">
                Our team is here to help you set up and manage your care plans effectively.
                Feel free to reach out if you need any guidance.
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default CareManagementPage;
