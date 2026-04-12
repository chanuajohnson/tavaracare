
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Calendar, Clock, ArrowRight, AlertTriangle, User, CheckCircle2, Trash2 } from "lucide-react";
import { MedicationWithAdministrations, medicationService } from "@/services/medicationService";
import { ConflictAwareAdministrationForm } from "@/components/medication/ConflictAwareAdministrationForm";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MedicationsTabProps {
  carePlanId: string;
}

export function MedicationsTab({ carePlanId }: MedicationsTabProps) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<MedicationWithAdministrations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicationForAdmin, setSelectedMedicationForAdmin] = useState<string | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const handleDeleteAdministration = async (administrationId: string) => {
    setDeletingAdminId(administrationId);
    const success = await medicationService.deleteAdministration(administrationId);
    if (success) {
      loadMedications();
    }
    setDeletingAdminId(null);
  };

  useEffect(() => {
    loadMedications();
  }, [carePlanId]);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const medicationData = await medicationService.getMedicationsForCarePlan(carePlanId);
      setMedications(medicationData);
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingDoses = medications
    .filter(med => med.next_dose)
    .sort((a, b) => new Date(a.next_dose!).getTime() - new Date(b.next_dose!).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-500" />
              Total Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Upcoming Doses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDoses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Active Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medications.filter(med => med.schedule && Object.keys(med.schedule).length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflict Detection Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Conflict Detection Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                The system now automatically detects when medications have been recently administered 
                by other caregivers and will alert you before recording duplicate entries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Medications with Quick Administration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medications & Quick Administration
            </span>
            <Link to={`/family/care-management/${carePlanId}/medications`}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No medications added</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding the first medication to this care plan.
              </p>
              <Link to={`/family/care-management/${carePlanId}/medications`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Medication
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {medications.slice(0, 5).map((medication) => (
                <div key={medication.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{medication.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {medication.dosage && <span>Dosage: {medication.dosage}</span>}
                        {medication.medication_type && <span>Type: {medication.medication_type}</span>}
                        {medication.adherence_rate !== undefined && (
                          <Badge className={
                            medication.adherence_rate >= 80 ? 'bg-green-100 text-green-700' :
                            medication.adherence_rate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {medication.adherence_rate}% adherence
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {medication.next_dose && (
                        <div className="text-right text-sm">
                          <div className="text-muted-foreground">Next dose</div>
                          <div className="font-medium">
                            {new Date(medication.next_dose).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMedicationForAdmin(
                          selectedMedicationForAdmin === medication.id ? null : medication.id
                        )}
                      >
                        {selectedMedicationForAdmin === medication.id ? 'Cancel' : 'Administer'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Administration Form */}
                  {selectedMedicationForAdmin === medication.id && (
                    <div className="border-t p-4 bg-gray-50">
                      <ConflictAwareAdministrationForm
                        medicationId={medication.id}
                        medicationName={medication.name}
                        onAdministrationRecorded={() => {
                          setSelectedMedicationForAdmin(null);
                          loadMedications(); // Refresh the list
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {medications.length > 5 && (
                <div className="text-center pt-4">
                  <Link to={`/family/care-management/${carePlanId}/medications`}>
                    <Button variant="outline">
                      View All {medications.length} Medications
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Administration Log */}
      {medications.some(m => m.recent_administrations && m.recent_administrations.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Recent Administration Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medications
                .flatMap(med =>
                  (med.recent_administrations || []).map(admin => ({
                    ...admin,
                    medicationName: med.name,
                    medicationDosage: med.dosage
                  }))
                )
                .sort((a, b) => new Date(b.administered_at).getTime() - new Date(a.administered_at).getTime())
                .slice(0, 10)
                .map((entry) => {
                  const profile = entry.administered_by_profile || (entry as any).profiles;
                  const adminName = profile?.full_name ||
                    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
                    (entry.administered_by_role === 'professional' ? 'Professional Caregiver' : 'Family Member');
                  const roleLabel = entry.administered_by_role === 'professional' ? 'Professional' : 'Family';

                  return (
                    <div key={entry.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 rounded-full p-1 ${entry.status === 'administered' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <CheckCircle2 className={`h-3.5 w-3.5 ${entry.status === 'administered' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{entry.medicationName}</p>
                          {entry.medicationDosage && (
                            <p className="text-xs text-muted-foreground">{entry.medicationDosage}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {adminName}
                            </span>
                            <Badge className={
                              entry.administered_by_role === 'professional'
                                ? 'bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0'
                                : 'bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0'
                            }>
                              {roleLabel}
                            </Badge>
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          <div>{new Date(entry.administered_at).toLocaleDateString()}</div>
                          <div>{new Date(entry.administered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        {user && entry.administered_by === user.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                disabled={deletingAdminId === entry.id}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Undo Administration?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this administration record for <strong>{entry.medicationName}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAdministration(entry.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Record
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}


      {upcomingDoses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Doses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDoses.map((medication) => (
                <div key={medication.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{medication.name}</h4>
                    <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Date(medication.next_dose!).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(medication.next_dose!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Management Link */}
      <div className="text-center">
        <Link to={`/family/care-management/${carePlanId}/medications`}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Pill className="h-5 w-5 mr-2" />
            Manage All Medications
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
