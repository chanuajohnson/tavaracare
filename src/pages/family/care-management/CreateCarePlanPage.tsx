
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { carePlanService } from "@/services/carePlanService";
import { fetchFamilyCareNeeds, generateDraftCarePlanFromCareNeeds } from "@/services/familyCareNeedsService";
import { DescriptionInput } from "@/components/care-plan/DescriptionInput";
import { CarePlanMetadata } from "@/types/carePlan";
import { fetchCarePlanById } from "@/services/care-plans";

const CreateCarePlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [careNeeds, setCareNeeds] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in edit mode (id parameter exists)
    if (id) {
      setIsEditMode(true);
      loadExistingCarePlan(id);
    } else {
      // If not in edit mode, load family care needs data for new plan creation
      loadCareNeeds();
    }
  }, [id, user]);

  const loadExistingCarePlan = async (planId: string) => {
    try {
      setLoading(true);
      const existingPlan = await fetchCarePlanById(planId);
      
      if (existingPlan) {
        setTitle(existingPlan.title);
        setDescription(existingPlan.description || "");
        // Store metadata in careNeeds for form submission
        if (existingPlan.metadata) {
          setCareNeeds({
            planType: existingPlan.metadata.planType,
            weekdayCoverage: existingPlan.metadata.weekdayCoverage,
            weekendCoverage: existingPlan.metadata.weekendCoverage,
            weekendScheduleType: existingPlan.metadata.weekendScheduleType,
          });
        }
      } else {
        toast.error("Care plan not found");
        navigate("/family/care-management");
      }
    } catch (err) {
      console.error("Error fetching care plan:", err);
      toast.error("Failed to load care plan");
      navigate("/family/care-management");
    } finally {
      setLoading(false);
    }
  };
  
  const loadCareNeeds = async () => {
    // Only load care needs data if we're in create mode
    if (user?.id) {
      try {
        const needsData = await fetchFamilyCareNeeds(user.id);
        setCareNeeds(needsData);
        
        // Generate a draft title, but don't auto-fill the description
        // to encourage the user to write their own concise summary
        if (needsData) {
          // Check if user.profile exists before accessing care_recipient_name
          const userProfile = user as any; // Cast to any to access profile property
          const draftPlan = generateDraftCarePlanFromCareNeeds(
            needsData, 
            { careRecipientName: userProfile.profile?.care_recipient_name }
          );
          setTitle(draftPlan.title);
        }
      } catch (err) {
        console.error("Error fetching care needs:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please enter a title for your care plan");
      return;
    }

    setLoading(true);
    
    try {
      // Generate metadata from care needs if available
      let planMetadata: CarePlanMetadata = {
        planType: 'scheduled' // Default value
      };
      
      if (careNeeds) {
        planMetadata = {
          planType: careNeeds.planType || 'scheduled',
          weekdayCoverage: careNeeds.weekdayCoverage,
          weekendCoverage: careNeeds.weekendCoverage,
          weekendScheduleType: careNeeds.weekendScheduleType,
          customShifts: []
        };
      }

      let updatedCarePlan;
      
      if (isEditMode && id) {
        // Update existing care plan
        updatedCarePlan = await carePlanService.updateCarePlan(id, {
          title,
          description,
          metadata: planMetadata
        });
        
        toast.success("Care plan updated successfully!");
      } else {
        // Create new care plan
        updatedCarePlan = await carePlanService.createCarePlan({
          title,
          description,
          familyId: user!.id,
          status: 'active',
          metadata: planMetadata
        });
        
        toast.success("Care plan created successfully!");
      }
      
      if (updatedCarePlan) {
        navigate(`/family/care-management/${updatedCarePlan.id}`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} care plan:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} care plan`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <Container>
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/family/care-management")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Management
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{isEditMode ? "Edit Care Plan" : "Create New Care Plan"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !isEditMode ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Care Plan Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your care plan"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A clear title helps you identify this care plan later
                  </p>
                </div>

                <DescriptionInput
                  value={description}
                  onChange={setDescription}
                  maxLength={150}
                  label="Care Plan Description"
                  helpText="Write a brief, personal summary of this care plan (1-2 short sentences max)"
                  placeholder="Example: Primary home care plan for Dad focusing on mobility assistance and medication management."
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/family/care-management")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Care Plan" : "Create Care Plan")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default CreateCarePlanPage;
