import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { FileText, Plus, Users, Calendar, ArrowLeft, Clock } from "lucide-react";
import { fetchCarePlans, CarePlan } from "@/services/care-plan-service";
import { toast } from "sonner";

const CareManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCarePlans(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCarePlans = async (userId: string) => {
    try {
      setLoading(true);
      const plans = await fetchCarePlans(userId);
      setCarePlans(plans);
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

  const getWeekdayCoverageDisplay = (plan: CarePlan) => {
    if (!plan.metadata?.weekday_coverage) return "None";
    
    return plan.metadata.weekday_coverage;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_dashboard_view" additionalData={{ section: "care_management" }} />
      
      <Container className="py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/dashboard/family")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Care Management</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage care plans for your loved ones
              </p>
            </div>
            
            <Button onClick={handleCreatePlan}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : carePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carePlans.map((plan) => (
              <Card 
                key={plan.id} 
                className="cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => handleViewPlan(plan.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {plan.title}
                  </CardTitle>
                  <CardDescription>
                    {plan.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Type: </span>
                      <span className="ml-2 font-medium">{getPlanTypeDisplay(plan)}</span>
                    </div>
                    
                    {plan.metadata?.plan_type !== 'on-demand' && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Weekday Coverage: </span>
                        <span className="ml-2 font-medium">{getWeekdayCoverageDisplay(plan)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                      <div>Status: <span className={`font-medium ${plan.status === 'active' ? 'text-green-600' : plan.status === 'completed' ? 'text-blue-600' : 'text-orange-600'}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span></div>
                      <div>Updated: {new Date(plan.updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>No Care Plans Found</CardTitle>
              <CardDescription>
                You haven't created any care plans yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Create your first care plan to start managing care for your loved one.</p>
              <Button onClick={handleCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Plan
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Care Plans
              </CardTitle>
              <CardDescription>Manage all care plans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create and manage detailed care plans for your loved ones.
              </p>
              <Button variant="secondary" className="w-full" onClick={handleCreatePlan}>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Care Team
              </CardTitle>
              <CardDescription>Manage team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add and manage caregivers and other members of your care team.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate("/family/care-management/team")}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
              <CardDescription>Manage care calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule appointments, tasks, and manage care shifts.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate("/family/care-management/schedule")}
              >
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default CareManagementPage;
