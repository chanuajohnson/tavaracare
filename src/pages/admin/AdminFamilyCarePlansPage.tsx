
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Container } from "@/components/ui/container";
import { ArrowLeft, Plus, FileText, Pill, ChefHat, Eye, Users, ClipboardList } from "lucide-react";
import { fetchCarePlans } from "@/services/care-plans";
import { CarePlan } from "@/types/carePlan";
import { toast } from "sonner";
import { fetchCarePlanEditLogs, CarePlanEditLogEntry } from "@/services/care-plans/carePlanEditLog";

interface FamilyProfile {
  id: string;
  full_name: string | null;
  email?: string;
}

const AdminFamilyCarePlansPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<FamilyProfile[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [editLogs, setEditLogs] = useState<Record<string, CarePlanEditLogEntry[]>>({});

  useEffect(() => {
    loadFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamilyId) {
      loadCarePlans(selectedFamilyId);
    } else {
      setCarePlans([]);
      setEditLogs({});
    }
  }, [selectedFamilyId]);

  const loadFamilies = async () => {
    try {
      setLoadingFamilies(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'family')
        .order('full_name');

      if (error) throw error;

      // Fetch emails from auth
      const { data: adminData } = await supabase.rpc('admin_get_all_profiles_secure');
      const emailMap = new Map(
        (adminData || [])
          .filter((p: any) => p.role === 'family')
          .map((p: any) => [p.id, p.email])
      );

      setFamilies(
        (data || []).map(f => ({
          ...f,
          email: emailMap.get(f.id) || undefined,
        }))
      );
    } catch (error) {
      console.error('Error loading families:', error);
      toast.error('Failed to load families');
    } finally {
      setLoadingFamilies(false);
    }
  };

  const loadCarePlans = async (familyId: string) => {
    try {
      setLoading(true);
      const plans = await fetchCarePlans(familyId);
      setCarePlans(plans);

      // Load edit logs for each plan
      const logsMap: Record<string, CarePlanEditLogEntry[]> = {};
      for (const plan of plans) {
        const logs = await fetchCarePlanEditLogs(plan.id);
        if (logs.length > 0) {
          logsMap[plan.id] = logs;
        }
      }
      setEditLogs(logsMap);
    } catch (error) {
      console.error('Error loading care plans:', error);
      toast.error('Failed to load care plans');
    } finally {
      setLoading(false);
    }
  };

  const selectedFamily = families.find(f => f.id === selectedFamilyId);

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard/admin")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Family Care Plans</h1>
          <p className="text-muted-foreground mt-1">
            Create and edit care plans on behalf of families. Changes are visible to the family immediately.
          </p>
        </div>

        {/* Family Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Family
            </CardTitle>
            <CardDescription>
              Choose a registered family to manage their care plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFamilyId} onValueChange={setSelectedFamilyId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder={loadingFamilies ? "Loading families..." : "Select a family..."} />
              </SelectTrigger>
              <SelectContent>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.full_name || 'Unnamed Family'} {family.email ? `(${family.email})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Selected Family's Care Plans */}
        {selectedFamilyId && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Care Plans for {selectedFamily?.full_name || 'Selected Family'}
              </h2>
              <Button onClick={() => navigate(`/family/care-management/create?familyId=${selectedFamilyId}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Care Plan for Family
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : carePlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {carePlans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {plan.title}
                      </CardTitle>
                      <CardDescription>
                        {plan.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          Status: <span className={`font-medium ${plan.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </span>
                        </div>

                        {editLogs[plan.id] && editLogs[plan.id].length > 0 && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            Last edit: {editLogs[plan.id][0].edit_summary} by {editLogs[plan.id][0].editor_name} ({new Date(editLogs[plan.id][0].created_at).toLocaleDateString()})
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/family/care-management/${plan.id}`)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View/Edit Plan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/family/care-management/${plan.id}?tab=medications`)}
                          >
                            <Pill className="mr-1 h-3 w-3" />
                            Medications
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/family/care-management/${plan.id}?tab=meals`)}
                          >
                            <ChefHat className="mr-1 h-3 w-3" />
                            Meals
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/family/care-management/${plan.id}?tab=daily-logs`)}
                          >
                            <ClipboardList className="mr-1 h-3 w-3" />
                            Daily Logs
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    This family has no care plans yet. Create one to get started.
                  </p>
                  <Button onClick={() => navigate(`/family/care-management/create?familyId=${selectedFamilyId}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Care Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default AdminFamilyCarePlansPage;
