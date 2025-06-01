
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { MedicationCard } from "@/components/medication/MedicationCard";
import { QuickAdministrationForm } from "@/components/medication/QuickAdministrationForm";
import { MedicationScheduleView } from "@/components/medication/MedicationScheduleView";
import { MedicationWithAdministrations, medicationService } from "@/services/medicationService";
import { useAuth } from "@/components/providers/AuthProvider";

export const MedicationDashboard = () => {
  const { user } = useAuth();
  const [medicationsByCarePlan, setMedicationsByCarePlan] = useState<{[carePlanId: string]: MedicationWithAdministrations[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedication, setSelectedMedication] = useState<MedicationWithAdministrations | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      loadAssignedMedications();
    }
  }, [user]);

  const loadAssignedMedications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const medications = await medicationService.getMedicationsForAssignedCarePlans(user.id);
      setMedicationsByCarePlan(medications);
    } catch (error) {
      console.error("Error loading assigned medications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminister = (medication: MedicationWithAdministrations, scheduledAt?: string) => {
    setSelectedMedication(medication);
    setScheduledTime(scheduledAt);
    setShowAdminForm(true);
  };

  const handleAdministrationSuccess = () => {
    loadAssignedMedications(); // Refresh data
  };

  const getAllMedications = () => {
    return Object.values(medicationsByCarePlan).flat();
  };

  const getUpcomingMedications = () => {
    const allMeds = getAllMedications();
    return allMeds.filter(med => med.next_dose && new Date(med.next_dose) <= new Date(Date.now() + 2 * 60 * 60 * 1000)); // Next 2 hours
  };

  const getOverdueMedications = () => {
    const allMeds = getAllMedications();
    return allMeds.filter(med => med.next_dose && new Date(med.next_dose) < new Date());
  };

  const upcomingMeds = getUpcomingMedications();
  const overdueMeds = getOverdueMedications();
  const allMeds = getAllMedications();

  // Get all care plan IDs for the schedule view
  const carePlanIds = Object.keys(medicationsByCarePlan);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading medications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allMeds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Pill className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No medications assigned</h3>
            <p className="text-muted-foreground">
              You don't have any medication management responsibilities at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Medications</p>
              <p className="text-2xl font-bold">{allMeds.length}</p>
            </div>
            <Pill className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming (2h)</p>
              <p className="text-2xl font-bold text-orange-600">{upcomingMeds.length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueMeds.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today's Schedule
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Urgent ({overdueMeds.length + upcomingMeds.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                All Medications ({allMeds.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4 mt-6">
              {carePlanIds.length > 0 ? (
                <div className="space-y-6">
                  {carePlanIds.map((carePlanId) => (
                    <div key={carePlanId} className="space-y-4">
                      <h3 className="text-lg font-medium">Care Plan: {carePlanId.substring(0, 8)}...</h3>
                      <MedicationScheduleView 
                        carePlanId={carePlanId}
                        onAdministrationUpdate={handleAdministrationSuccess}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No care plans assigned</h3>
                  <p className="text-muted-foreground">
                    You don't have any care plans with medication schedules at this time.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="urgent" className="space-y-4 mt-6">
              {overdueMeds.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-medium text-red-700">Overdue Medications</h3>
                  </div>
                  {overdueMeds.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onAdminister={() => handleQuickAdminister(medication)}
                      showAdminActions={true}
                      userRole="professional"
                    />
                  ))}
                </div>
              )}

              {upcomingMeds.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-medium text-orange-700">Upcoming Medications (Next 2 Hours)</h3>
                  </div>
                  {upcomingMeds.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onAdminister={() => handleQuickAdminister(medication)}
                      showAdminActions={true}
                      userRole="professional"
                    />
                  ))}
                </div>
              )}

              {overdueMeds.length === 0 && upcomingMeds.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No urgent medication administrations at this time.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-6">
              {Object.entries(medicationsByCarePlan).map(([carePlanId, medications]) => (
                <div key={carePlanId} className="space-y-4">
                  <h3 className="text-lg font-medium">Care Plan: {carePlanId.substring(0, 8)}...</h3>
                  {medications.map((medication) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onAdminister={() => handleQuickAdminister(medication)}
                      showAdminActions={true}
                      userRole="professional"
                    />
                  ))}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Daily Schedule View</h3>
                <p className="text-muted-foreground">
                  Calendar view of today's medication schedule coming soon...
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Administration Form */}
      {selectedMedication && (
        <QuickAdministrationForm
          medication={selectedMedication}
          isOpen={showAdminForm}
          onClose={() => {
            setShowAdminForm(false);
            setSelectedMedication(null);
            setScheduledTime(undefined);
          }}
          onSuccess={handleAdministrationSuccess}
          scheduledTime={scheduledTime}
        />
      )}
    </div>
  );
};
