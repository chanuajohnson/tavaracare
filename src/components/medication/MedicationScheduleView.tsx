
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { useAuth } from "@/components/providers/AuthProvider";
import { medicationService, MedicationWithAdministrations } from "@/services/medicationService";
import { medicationConflictService, ConflictResolution } from "@/services/medicationConflictService";
import { ConflictResolutionDialog } from "./ConflictResolutionDialog";
import { toast } from "sonner";

interface MedicationScheduleViewProps {
  carePlanId: string;
  onAdministrationUpdate?: () => void;
}

interface ScheduledDose {
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  administered: boolean;
  administrationId?: string;
  conflictDetected?: boolean;
}

export function MedicationScheduleView({ carePlanId, onAdministrationUpdate }: MedicationScheduleViewProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<MedicationWithAdministrations[]>([]);
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDose[]>([]);
  const [selectedDoses, setSelectedDoses] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<any>(null);

  useEffect(() => {
    loadMedicationsAndSchedule();
  }, [carePlanId, selectedDate]);

  const loadMedicationsAndSchedule = async () => {
    setIsLoading(true);
    try {
      const medicationData = await medicationService.getMedicationsForCarePlan(carePlanId);
      setMedications(medicationData);
      
      // Generate scheduled doses for the selected date
      const doses = generateScheduledDoses(medicationData, selectedDate);
      setScheduledDoses(doses);
    } catch (error) {
      console.error("Error loading medications:", error);
      toast.error("Failed to load medication schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const generateScheduledDoses = (meds: MedicationWithAdministrations[], date: Date): ScheduledDose[] => {
    const doses: ScheduledDose[] = [];
    const dateStart = startOfDay(date);
    const dateEnd = endOfDay(date);

    meds.forEach(med => {
      if (med.schedule?.times && Array.isArray(med.schedule.times)) {
        med.schedule.times.forEach((time: string) => {
          const doseDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time}`);
          
          // Check if this dose was already administered
          const administered = med.recent_administrations?.some(admin => {
            const adminDate = new Date(admin.administered_at);
            return adminDate >= dateStart && adminDate <= dateEnd &&
                   Math.abs(adminDate.getTime() - doseDateTime.getTime()) < 2 * 60 * 60 * 1000; // 2 hour window
          });

          const administrationRecord = med.recent_administrations?.find(admin => {
            const adminDate = new Date(admin.administered_at);
            return adminDate >= dateStart && adminDate <= dateEnd &&
                   Math.abs(adminDate.getTime() - doseDateTime.getTime()) < 2 * 60 * 60 * 1000;
          });

          doses.push({
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage || '',
            time: time,
            administered: !!administered,
            administrationId: administrationRecord?.id,
            conflictDetected: false // Will be updated during administration
          });
        });
      }
    });

    return doses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleDoseSelection = (doseKey: string, checked: boolean) => {
    const newSelected = new Set(selectedDoses);
    if (checked) {
      newSelected.add(doseKey);
    } else {
      newSelected.delete(doseKey);
    }
    setSelectedDoses(newSelected);
  };

  const getDoseKey = (dose: ScheduledDose) => `${dose.medicationId}-${dose.time}`;

  const handleBatchAdministration = async () => {
    if (!user || selectedDoses.size === 0) return;

    setIsSubmitting(true);
    const conflicts = [];
    const successful = [];

    try {
      for (const doseKey of selectedDoses) {
        const dose = scheduledDoses.find(d => getDoseKey(d) === doseKey);
        if (!dose || dose.administered) continue;

        const administeredAt = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${dose.time}`).toISOString();
        
        const result = await medicationService.recordAdministrationWithConflictDetection(
          dose.medicationId,
          administeredAt,
          user.id,
          'family'
        );

        if (result.requiresResolution) {
          conflicts.push({ dose, result });
        } else if (result.success) {
          successful.push(dose);
        }
      }

      if (conflicts.length > 0) {
        // Handle conflicts - for now, show the first one
        setConflictInfo(conflicts[0]);
        setShowConflictDialog(true);
      } else {
        // All successful
        toast.success(`${successful.length} medication(s) administered successfully`);
        setSelectedDoses(new Set());
        loadMedicationsAndSchedule();
        onAdministrationUpdate?.();
      }
    } catch (error) {
      console.error("Error during batch administration:", error);
      toast.error("Failed to record some administrations");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConflictResolution = async (resolution: ConflictResolution) => {
    if (!user || !conflictInfo) return;

    try {
      const { dose, result } = conflictInfo;
      const administeredAt = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${dose.time}`).toISOString();
      
      const finalResult = await medicationService.recordAdministrationWithConflictDetection(
        dose.medicationId,
        administeredAt,
        user.id,
        'family',
        undefined,
        resolution
      );

      if (finalResult.success) {
        toast.success("Administration recorded successfully");
        setShowConflictDialog(false);
        setConflictInfo(null);
        
        // Remove this dose from selected
        const doseKey = getDoseKey(dose);
        const newSelected = new Set(selectedDoses);
        newSelected.delete(doseKey);
        setSelectedDoses(newSelected);
        
        loadMedicationsAndSchedule();
        onAdministrationUpdate?.();
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
      toast.error("Failed to resolve conflict");
    }
  };

  const getStatusBadge = (dose: ScheduledDose) => {
    if (dose.administered) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Administered</Badge>;
    }
    
    const doseTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${dose.time}`);
    const now = new Date();
    
    if (isToday(selectedDate) && doseTime < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    
    return <Badge variant="outline">Pending</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading medication schedule...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Medication Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border rounded px-3 py-1"
                />
              </div>
              
              {isToday(selectedDate) && (
                <Badge className="bg-blue-100 text-blue-800">Today</Badge>
              )}
            </div>

            {selectedDoses.size > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {selectedDoses.size} medication(s) selected
                </span>
                <Button
                  onClick={handleBatchAdministration}
                  disabled={isSubmitting}
                  size="sm"
                  className="ml-auto"
                >
                  {isSubmitting ? "Recording..." : "Mark as Administered"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Doses */}
        <div className="space-y-3">
          {scheduledDoses.length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No medications scheduled</h3>
              <p className="text-muted-foreground">
                No medications are scheduled for {format(selectedDate, 'PPP')}
              </p>
            </Card>
          ) : (
            scheduledDoses.map((dose) => {
              const doseKey = getDoseKey(dose);
              return (
                <Card key={doseKey} className={`${dose.administered ? 'bg-gray-50' : ''}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedDoses.has(doseKey)}
                        onCheckedChange={(checked) => handleDoseSelection(doseKey, checked as boolean)}
                        disabled={dose.administered}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{dose.medicationName}</h4>
                          {getStatusBadge(dose)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {dose.time}
                          </div>
                          {dose.dosage && (
                            <span>Dosage: {dose.dosage}</span>
                          )}
                        </div>
                      </div>

                      {dose.conflictDetected && (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Conflict Resolution Dialog */}
      {conflictInfo && (
        <ConflictResolutionDialog
          open={showConflictDialog}
          onOpenChange={setShowConflictDialog}
          medicationName={conflictInfo.dose.medicationName}
          conflicts={conflictInfo.result.conflicts || []}
          timeWindow={conflictInfo.result.timeWindow || 2}
          onResolve={handleConflictResolution}
          onCancel={() => {
            setShowConflictDialog(false);
            setConflictInfo(null);
          }}
        />
      )}
    </>
  );
}
