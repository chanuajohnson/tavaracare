
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const CreateCarePlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [careNeeds, setCareNeeds] = useState<any>(null);
  
  useEffect(() => {
    // Load family care needs data
    const loadCareNeeds = async () => {
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
    
    loadCareNeeds();
  }, [user]);

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
      
      const newCarePlan = await carePlanService.createCarePlan({
        title,
        description,
        familyId: user!.id,
        status: 'active',
        metadata: planMetadata
      });
      
      toast.success("Care plan created successfully!");
      navigate(`/family/care-management/${newCarePlan.id}`);
    } catch (error) {
      console.error("Error creating care plan:", error);
      toast.error("Failed to create care plan");
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
            <CardTitle className="text-2xl">Create New Care Plan</CardTitle>
          </CardHeader>
          <CardContent>
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
                helpText="Provide a brief summary of this care plan (1-2 sentences)"
                placeholder="Enter a concise description of this care plan..."
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
                  {loading ? "Creating..." : "Create Care Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default CreateCarePlanPage;
