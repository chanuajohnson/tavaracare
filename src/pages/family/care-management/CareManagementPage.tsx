
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { FileText, Plus, Users, Calendar, ArrowLeft, Clock, Edit, Pencil, Settings, Activity } from "lucide-react";
import { fetchCarePlans, CarePlan } from "@/services/care-plans";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const CareManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

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
      console.log("Fetched care plans:", plans);
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

  // Edit plan details (title, description, status, schedule)
  const handleEditPlanDetails = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/family/care-management/create/${planId}`);
  };

  // Edit registration/profile information
  const handleEditRegistration = (e: React.MouseEvent, planId: string, familyId: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    // Store the plan ID in local storage for reference
    localStorage.setItem("edit_care_plan_id", planId);
    
    // Navigate to the registration page with edit parameter
    navigate(`/registration/family?edit=true&careplan=${planId}`);
  };

  // Edit care needs information 
  const handleEditCareNeeds = (e: React.MouseEvent, planId: string, familyId: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    // Store the plan ID in local storage for reference
    localStorage.setItem("edit_care_plan_id", planId);
    
    // Navigate to the care needs page with edit parameter
    navigate(`/careneeds/family?edit=true&careplan=${planId}`);
  };

  const getPlanTypeDisplay = (plan: CarePlan) => {
    if (!plan.metadata?.planType) return "Not specified";
    
    switch (plan.metadata.planType) {
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
    if (!plan.metadata?.weekdayCoverage || plan.metadata.weekdayCoverage === 'none') return "None";
    
    switch (plan.metadata.weekdayCoverage) {
      case '8am-4pm':
        return "Standard (8AM-4PM)";
      case '8am-6pm':
        return "Extended (8AM-6PM)";
      case '6am-6pm':
        return "Full day (6AM-6PM)";
      case '6pm-8am':
        return "Overnight (6PM-8AM)";
      default:
        return plan.metadata.weekdayCoverage;
    }
  };

  // Truncate description to a reasonable length
  const truncateDescription = (description: string, maxLength: number = 60) => {
    if (!description) return "No description provided";
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {carePlans.map((plan) => (
              <Card 
                key={plan.id} 
                className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden" 
                onClick={() => handleViewPlan(plan.id)}
              >
                <div className="absolute top-3 right-3 z-10 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/70 hover:bg-white shadow-sm"
                    onClick={(e) => handleEditPlanDetails(e, plan.id)}
                    title="Edit plan details"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/70 hover:bg-white shadow-sm"
                    onClick={(e) => handleEditRegistration(e, plan.id, plan.familyId)}
                    title="Edit profile information"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/70 hover:bg-white shadow-sm"
                    onClick={(e) => handleEditCareNeeds(e, plan.id, plan.familyId)}
                    title="Edit care needs"
                  >
                    <Activity className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardHeader className={`pb-2 ${isMobile ? 'p-4' : 'p-6'}`}>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{plan.title}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {truncateDescription(plan.description, isMobile ? 40 : 60)}
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${isMobile ? 'p-4 pt-1' : 'p-6 pt-2'}`}>
                  <div className="space-y-3">
                    <div className={`${isMobile ? 'flex flex-col space-y-2' : 'grid grid-cols-2 gap-2'} text-sm`}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground mr-1 whitespace-nowrap">Type:</span>
                        <span className="font-medium truncate">{getPlanTypeDisplay(plan)}</span>
                      </div>
                      
                      {plan.metadata?.planType !== 'on-demand' && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground mr-1 whitespace-nowrap">Coverage:</span>
                          <span className="font-medium truncate">{getWeekdayCoverageDisplay(plan)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center">
                        <span>Status: </span>
                        <span className={`ml-1 font-medium ${
                          plan.status === 'active' ? 'text-green-600' : 
                          plan.status === 'completed' ? 'text-blue-600' : 
                          'text-orange-600'
                        }`}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs">
                        Updated {new Date(plan.updatedAt).toLocaleDateString()}
                      </div>
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

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <Card className="sm:col-span-2 lg:col-span-1">
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
