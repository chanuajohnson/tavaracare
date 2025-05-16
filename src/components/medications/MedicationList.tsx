
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { medicationService } from '@/services/medicationService';
import { Medication, MedicationFormData } from '@/types/medicationTypes';
import MedicationCard from './MedicationCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MedicationForm from './MedicationForm';
import { useAuth } from '@/components/providers/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MedicationListProps {
  carePlanId: string;
  userRole: 'family' | 'professional';
}

const MedicationList: React.FC<MedicationListProps> = ({ carePlanId, userRole }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  
  const isCaregiver = userRole === 'professional';

  useEffect(() => {
    fetchMedications();
  }, [carePlanId, refreshTrigger]);

  const fetchMedications = async () => {
    if (!carePlanId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await medicationService.fetchMedications(carePlanId);
      console.log("Fetched medications:", data);
      setMedications(data);
    } catch (err) {
      setError('Failed to load medications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = (formData: MedicationFormData) => {
    const newMedication = {
      ...formData,
      care_plan_id: carePlanId
    };
    
    medicationService.createMedication(newMedication)
      .then(medication => {
        if (medication) {
          setMedications(prev => [...prev, medication]);
          setShowAddDialog(false);
          toast.success(`Added ${medication.name} to medications`);
        }
      });
  };

  const handleEditMedication = (formData: MedicationFormData) => {
    if (!currentMedication) return;
    
    medicationService.updateMedication(currentMedication.id, formData)
      .then(updatedMedication => {
        if (updatedMedication) {
          setMedications(prev => prev.map(med => 
            med.id === currentMedication.id ? updatedMedication : med
          ));
          setShowAddDialog(false);
          setCurrentMedication(null);
          toast.success(`Updated ${updatedMedication.name} successfully`);
        }
      });
  };

  const handleDeleteClick = (medicationId: string) => {
    const medication = medications.find(med => med.id === medicationId);
    if (medication) {
      setCurrentMedication(medication);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = () => {
    if (!currentMedication) return;
    
    medicationService.deleteMedication(currentMedication.id)
      .then(success => {
        if (success) {
          setMedications(prev => prev.filter(med => med.id !== currentMedication.id));
          setShowDeleteDialog(false);
          setCurrentMedication(null);
          toast.success(`${currentMedication.name} has been removed`);
        }
      });
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-baseline">
          <h2 className="text-xl font-bold">{medications.length > 0 ? 'Current Medications' : 'No Medications'}</h2>
          {medications.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {medications.length}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          
          {!isCaregiver && (
            <Button size="sm" onClick={() => {
              setCurrentMedication(null);
              setShowAddDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading medications...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <AlertCircle className="h-8 w-8 mx-auto" />
          <p className="mt-2">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No medications have been added yet.</p>
          {!isCaregiver && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Medication
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-[500px] pr-4 px-2">
            <div className="space-y-3 p-3">
              {medications.map(medication => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onEdit={(med) => {
                    setCurrentMedication(med);
                    setShowAddDialog(true);
                  }}
                  onDelete={handleDeleteClick}
                  onAdministrationRecorded={handleRefresh}
                  isCaregiver={isCaregiver}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="bg-muted/30 text-center py-2 text-sm text-muted-foreground">
            {medications.length} {medications.length === 1 ? 'medication' : 'medications'} in total
          </div>
        </div>
      )}
      
      {/* Add/Edit Medication Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentMedication ? 'Edit Medication' : 'Add New Medication'}
            </DialogTitle>
          </DialogHeader>
          <MedicationForm
            initialData={currentMedication || undefined}
            onSubmit={currentMedication ? handleEditMedication : handleAddMedication}
            onCancel={() => {
              setShowAddDialog(false);
              setCurrentMedication(null);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentMedication?.name}{currentMedication?.dosage ? ` (${currentMedication.dosage})` : ''} from the medication list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setCurrentMedication(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicationList;
