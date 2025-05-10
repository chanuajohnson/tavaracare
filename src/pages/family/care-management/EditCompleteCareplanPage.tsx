import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { profileService } from "@/services/profileService";
import { fetchFamilyCareNeeds, saveFamilyCareNeeds } from "@/services/familyCareNeedsService";
import { fetchCarePlanById, updateCarePlan } from "@/services/care-plans";
import { EditRegistrationSection } from "@/components/care-plan/EditRegistrationSection";
import { EditCareNeedsSection } from "@/components/care-plan/EditCareNeedsSection";
import { EditPlanDetailsSection } from "@/components/care-plan/EditPlanDetailsSection";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { 
  convertMetadataToProfileSchedule, 
  parseScheduleString, 
  parseCustomScheduleText,
  determineWeekdayCoverage, 
  determineWeekendCoverage, 
  determineWeekendScheduleType 
} from "@/utils/scheduleUtils";

const EditCompleteCareplanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [careNeeds, setCareNeeds] = useState<any>(null);
  const [carePlan, setCarePlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  useEffect(() => {
    if (user?.id && id) {
      loadAllData(user.id, id);
    }
  }, [user, id]);

  const loadAllData = async (userId: string, carePlanId: string) => {
    setLoading(true);
    
    try {
      console.log("Loading all data for care plan", carePlanId);
      
      // Fetch profile data
      const profileData = await profileService.getCurrentUserProfile();
      console.log("Loaded profile data:", profileData);
      setProfile(profileData);
      
      // Fetch care needs data
      const careNeedsData = await fetchFamilyCareNeeds(userId);
      console.log("Loaded care needs data:", careNeedsData);
      setCareNeeds(careNeedsData);
      
      // Fetch care plan data
      const carePlanData = await fetchCarePlanById(carePlanId);
      console.log("Loaded care plan data:", carePlanData);
      setCarePlan(carePlanData);
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load care plan data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id || !id || !profile || !careNeeds || !carePlan) {
      toast.error("Missing required data to save");
      return;
    }
    
    setSaving(true);
    
    try {
      console.log("Saving all care plan data");
      
      // Extract custom schedule
      const customSchedule = profile.customSchedule || profile.custom_schedule || '';
      const hasCustomSchedule = customSchedule && customSchedule.trim() !== '';
      
      // Determine if care schedule includes the custom flag
      const careScheduleArray = Array.isArray(profile.careSchedule) 
        ? profile.careSchedule 
        : parseScheduleString(profile.careSchedule);
      
      // Add 'custom' flag if not already there
      if (hasCustomSchedule && !careScheduleArray.includes('custom')) {
        careScheduleArray.push('custom');
      }
      
      // Update profile with schedule from care plan if available
      if (carePlan.metadata && (carePlan.metadata.weekdayCoverage || carePlan.metadata.weekendCoverage)) {
        // Convert care plan metadata schedule format to profile care_schedule format
        const scheduleArray = convertMetadataToProfileSchedule(carePlan.metadata);
        
        // Convert array to string for database compatibility
        const scheduleString = scheduleArray.join(',');
        
        // Update the profile object before saving
        profile.careSchedule = scheduleString;
        profile.care_schedule = scheduleString;
        console.log("Updated profile care schedule from metadata:", scheduleArray, "as string:", scheduleString);
      }
      
      // Parse any custom schedule text if available
      let customShifts = [];
      if (hasCustomSchedule) {
        customShifts = parseCustomScheduleText(customSchedule);
        console.log("Parsed custom schedule text:", customShifts);
      }
      
      // Save profile updates
      await profileService.saveProfile({
        ...profile,
        care_schedule: profile.careSchedule,
        custom_schedule: customSchedule
      });
      console.log("Profile data saved");
      
      // Determine schedule types
      const weekdayCoverage = determineWeekdayCoverage(careScheduleArray);
      const weekendCoverageValue = determineWeekendCoverage(careScheduleArray);
      const weekendScheduleType = weekendCoverageValue === 'yes'
        ? determineWeekendScheduleType(careScheduleArray)
        : 'none';
      
      // Update care needs with schedule from care plan metadata
      careNeeds.weekdayCoverage = weekdayCoverage;
      careNeeds.weekendCoverage = weekendCoverageValue;
      careNeeds.weekendScheduleType = weekendScheduleType;
      careNeeds.planType = carePlan.metadata?.planType || 'scheduled';
      
      // Save care needs updates
      await saveFamilyCareNeeds(careNeeds);
      console.log("Care needs data saved");
      
      // Update care plan metadata
      const updatedMetadata = {
        ...(carePlan.metadata || {}),
        planType: weekdayCoverage !== 'none' || hasCustomSchedule ? 'scheduled' : 'on-demand',
        weekdayCoverage,
        weekendCoverage: weekendCoverageValue,
        weekendScheduleType,
        customShifts: customShifts.length > 0 ? customShifts : carePlan.metadata?.customShifts
      };
      
      // Save care plan updates
      await updateCarePlan(carePlan.id, {
        title: carePlan.title,
        description: carePlan.description,
        metadata: updatedMetadata,
        status: carePlan.status
      });
      console.log("Care plan data saved with updated metadata:", updatedMetadata);
      
      toast.success("All care plan data updated successfully!");
      navigate(`/family/care-management/${carePlan.id}`);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please sign in to edit your care plan.</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker actionType="family_edit_complete_care_plan" additionalData={{ plan_id: id }} />
      
      <Container className="py-8">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(`/family/care-management/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Care Plan
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit Complete Care Plan</h1>
            <p className="text-muted-foreground mt-1">
              Edit all aspects of your care plan including profile information, care needs, and plan details
            </p>
          </div>
          
          <Button 
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>

        <Separator className="my-4" />
        
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6 w-full md:w-auto">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="care-needs">Care Needs</TabsTrigger>
              <TabsTrigger value="plan-details">Plan Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Edit basic information about the care recipient and relationship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile && (
                    <EditRegistrationSection 
                      data={profile} 
                      onChange={(updatedProfile) => setProfile({ ...profile, ...updatedProfile })} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="care-needs">
              <Card>
                <CardHeader>
                  <CardTitle>Care Needs</CardTitle>
                  <CardDescription>
                    Edit detailed care requirements and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {careNeeds && (
                    <EditCareNeedsSection 
                      data={careNeeds} 
                      onChange={(updatedNeeds) => {
                        const newNeeds = { ...careNeeds, ...updatedNeeds };
                        
                        // If care needs schedule is updated, sync to care plan metadata
                        if ('weekdayCoverage' in updatedNeeds || 
                            'weekendCoverage' in updatedNeeds ||
                            'weekendScheduleType' in updatedNeeds) {
                          
                          // Update care plan metadata with the new schedule
                          const updatedMetadata = {
                            ...(carePlan.metadata || {}),
                            weekdayCoverage: newNeeds.weekdayCoverage || 'none',
                            weekendCoverage: newNeeds.weekendCoverage || 'no',
                            weekendScheduleType: newNeeds.weekendScheduleType || 'none',
                            planType: newNeeds.weekdayCoverage && newNeeds.weekdayCoverage !== 'none' ? 'scheduled' : 'on-demand'
                          };
                          
                          // Update the care plan state
                          setCarePlan({
                            ...carePlan,
                            metadata: updatedMetadata
                          });
                          
                          console.log("Synchronized care plan metadata with care needs schedule:", updatedMetadata);
                        }
                        
                        // Update care needs state
                        setCareNeeds(newNeeds);
                      }} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="plan-details">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>
                    Edit care plan title, description, and schedule preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {carePlan && (
                    <EditPlanDetailsSection 
                      data={carePlan} 
                      onChange={(updatedPlan) => {
                        const newPlan = { ...carePlan, ...updatedPlan };
                        
                        // If care plan metadata is updated, sync to care needs
                        if (newPlan.metadata) {
                          // Update care needs with the new schedule
                          const updatedNeeds = {
                            ...careNeeds,
                            weekdayCoverage: newPlan.metadata.weekdayCoverage || 'none',
                            weekendCoverage: newPlan.metadata.weekendCoverage || 'no',
                            weekendScheduleType: newPlan.metadata.weekendScheduleType || 'none',
                            planType: newPlan.metadata.planType || 'scheduled'
                          };
                          
                          // Update the care needs state
                          setCareNeeds(updatedNeeds);
                          
                          console.log("Synchronized care needs with care plan metadata:", newPlan.metadata);
                        }
                        
                        // Update care plan state
                        setCarePlan(newPlan);
                      }} 
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {!loading && (
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default EditCompleteCareplanPage;
