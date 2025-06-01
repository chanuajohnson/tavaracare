
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Calendar, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { MedicationWithAdministrations, medicationService } from "@/services/medicationService";
import { ConflictAwareAdministrationForm } from "@/components/medication/ConflictAwareAdministrationForm";
import { Badge } from "@/components/ui/badge";

interface MedicationsTabProps {
  carePlanId: string;
}

export function MedicationsTab({ carePlanId }: MedicationsTabProps) {
  const [medications, setMedications] = useState<MedicationWithAdministrations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicationForAdmin, setSelectedMedicationForAdmin] = useState<string | null>(null);

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

      {/* Upcoming Doses */}
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
