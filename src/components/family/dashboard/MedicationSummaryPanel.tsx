
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, AlertCircle } from 'lucide-react';
import { medicationService } from '@/services/medicationService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MedicationSummaryPanelProps {
  userCarePlans: any[];
  loading: boolean;
}

const MedicationSummaryPanel: React.FC<MedicationSummaryPanelProps> = ({ userCarePlans, loading }) => {
  const [medicationsByPlan, setMedicationsByPlan] = useState<Record<string, any[]>>({});
  const [loadingMeds, setLoadingMeds] = useState(true);
  const hasCarePlans = userCarePlans.length > 0;
  const activePlan = userCarePlans.length > 0 ? userCarePlans[0] : null;

  useEffect(() => {
    if (!hasCarePlans) {
      setLoadingMeds(false);
      return;
    }

    const fetchMedications = async () => {
      setLoadingMeds(true);
      try {
        const medsByPlan: Record<string, any[]> = {};
        
        // Only get medications for the first (most recent) care plan
        if (activePlan) {
          const meds = await medicationService.fetchMedications(activePlan.id);
          medsByPlan[activePlan.id] = meds;
        }
        
        setMedicationsByPlan(medsByPlan);
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoadingMeds(false);
      }
    };

    fetchMedications();
  }, [userCarePlans]);

  const totalMedicationCount = Object.values(medicationsByPlan).reduce(
    (sum, meds) => sum + meds.length, 0
  );

  // Get medications for active plan
  const activePlanMedications = activePlan ? (medicationsByPlan[activePlan.id] || []) : [];

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Pill className="mr-2 h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasCarePlans) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Pill className="mr-2 h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-2">No care plans found</p>
            <Link to="/family/care-management/create">
              <Button variant="outline" size="sm">Create Care Plan</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Pill className="mr-2 h-5 w-5" />
            Medications
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {totalMedicationCount} {totalMedicationCount === 1 ? 'medication' : 'medications'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingMeds ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : activePlanMedications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-2">No medications added yet</p>
            <Link to={`/family/care-management/${activePlan.id}`}>
              <Button variant="outline" size="sm">Manage Medications</Button>
            </Link>
          </div>
        ) : (
          <div>
            <ScrollArea className="max-h-[180px]">
              <div className="space-y-2">
                {activePlanMedications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage || ''} {med.dosage && med.instructions ? '•' : ''} {med.instructions || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-4 flex justify-center">
              <Link to={`/family/care-management/${activePlan.id}`}>
                <Button size="sm">Manage Medications</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationSummaryPanel;
