import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { Container } from "@/components/ui/container";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchCarePlanById, 
  fetchCareTeamMembers, 
  removeCareTeamMember,
  fetchCareShifts,
  deleteCareShift,
  CarePlan,
  CareTeamMemberWithProfile,
  CareShift,
  ProfessionalDetails
} from "@/services/care-plans";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { CareTeamTab } from "@/components/care-plan/CareTeamTab";
import { PlanDetailsTab } from "@/components/care-plan/PlanDetailsTab";
import { ScheduleTab } from "@/components/care-plan/ScheduleTab";
import { PayrollTab } from "@/components/care-plan/PayrollTab";

interface Professional {
  id: string;
  full_name: string | null;
  professional_type: string | null;
  avatar_url: string | null;
}

const CarePlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [careTeamMembers, setCareTeamMembers] = useState<CareTeamMemberWithProfile[]>([]);
  const [careShifts, setCareShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CareTeamMemberWithProfile | null>(null);

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
      const plan = await fetchCarePlanById(id);
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
      let members = await fetchCareTeamMembers(id);
      
      const membersWithDetails = await Promise.all(members.map(async (member) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, professional_type, avatar_url')
          .eq('id', member.caregiverId)
          .single();
        
        return {
          ...member,
          professionalDetails: error ? undefined : (data as ProfessionalDetails)
        } as CareTeamMemberWithProfile;
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
          <div className="flex flex-col p-6">
            <h2 className="text-2xl font-semibold mb-2">Care Plan Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested care plan could not be found.
            </p>
            <Button onClick={() => navigate("/family/care-management")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Care Management
            </Button>
          </div>
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
            <TabsTrigger value="payroll">Payroll & Hours</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <PlanDetailsTab carePlan={carePlan!} />
          </TabsContent>
          
          <TabsContent value="team">
            <CareTeamTab 
              carePlanId={id!}
              familyId={user!.id}
              careTeamMembers={careTeamMembers}
              professionals={professionals}
              onMemberAdded={loadCareTeamMembers}
              onMemberRemoveRequest={(member) => {
                setMemberToRemove(member);
                setConfirmRemoveDialogOpen(true);
              }}
            />
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScheduleTab
              carePlanId={id!}
              familyId={user!.id}
              careShifts={careShifts}
              careTeamMembers={careTeamMembers}
              onShiftUpdated={loadCareShifts}
              onDeleteShift={handleDeleteShift}
            />
          </TabsContent>
          
          <TabsContent value="payroll">
            <PayrollTab carePlanId={id!} />
          </TabsContent>
        </Tabs>
      </Container>

      <Dialog open={confirmRemoveDialogOpen} onOpenChange={setConfirmRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to remove {memberToRemove?.professionalDetails?.full_name || memberToRemove?.caregiverId} from the care team?
            </p>
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
