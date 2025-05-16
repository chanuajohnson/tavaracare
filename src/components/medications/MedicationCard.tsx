
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit, Trash2, Info, CalendarClock, CheckCircle, AlertCircle } from 'lucide-react';
import { Medication, MedicationAdministration } from '@/types/medicationTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { medicationService } from '@/services/medicationService';
import { useAuth } from '@/components/providers/AuthProvider';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
  onAdministrationRecorded: () => void;
  isCaregiver?: boolean;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ 
  medication, 
  onEdit, 
  onDelete,
  onAdministrationRecorded,
  isCaregiver = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [administrations, setAdministrations] = useState<MedicationAdministration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdministerDialog, setShowAdministerDialog] = useState(false);
  const [administerStatus, setAdministerStatus] = useState<'administered' | 'skipped' | 'refused'>('administered');
  const [notes, setNotes] = useState('');
  const { user } = useAuth();

  const handleShowDetails = async () => {
    if (!showDetails) {
      setLoading(true);
      try {
        const administrationData = await medicationService.fetchAdministrations(medication.id);
        setAdministrations(administrationData);
      } catch (error) {
        console.error('Error fetching medication administrations:', error);
      } finally {
        setLoading(false);
      }
    }
    setShowDetails(!showDetails);
  };

  const handleAdminister = async () => {
    if (!user?.id) return;
    
    try {
      const administration: Omit<MedicationAdministration, 'id' | 'created_at' | 'updated_at' | 'caregiver_name'> = {
        medication_id: medication.id,
        administered_by: user.id,
        administered_at: new Date().toISOString(),
        status: administerStatus,
        notes: notes
      };
      
      await medicationService.recordAdministration(administration);
      setShowAdministerDialog(false);
      setNotes('');
      setAdministerStatus('administered');
      onAdministrationRecorded();
    } catch (error) {
      console.error('Error recording administration:', error);
    }
  };

  // Format the schedule display
  const renderSchedule = () => {
    if (!medication.schedule) return 'As prescribed';
    
    const { morning, afternoon, evening, night, custom } = medication.schedule;
    
    if (custom) return custom;
    
    const times = [];
    if (morning) times.push('Morning');
    if (afternoon) times.push('Afternoon');
    if (evening) times.push('Evening');
    if (night) times.push('Night');
    
    return times.length > 0 ? times.join(', ') : 'As prescribed';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'administered':
        return <Badge className="bg-green-500">Administered</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-500">Skipped</Badge>;
      case 'refused':
        return <Badge className="bg-red-500">Refused</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Extract prescription terms if available
  const prescriptionTerms = medication.prescription_terms ? 
    medication.prescription_terms.split(' ').map(term => term.trim()).filter(Boolean) : 
    [];

  return (
    <>
      <Card className="shadow-sm border-gray-200 transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{medication.name}</CardTitle>
              <CardDescription>
                {medication.dosage && <span className="font-medium">{medication.dosage}</span>}
                {medication.instructions && <span> • {medication.instructions}</span>}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              {!isCaregiver && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(medication)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(medication.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-muted-foreground mb-1.5">
            <Clock className="h-4 w-4 mr-1.5" /> 
            <span>{renderSchedule()}</span>
          </div>
          
          {prescriptionTerms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <TooltipProvider>
                {prescriptionTerms.map((term, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">
                        {term}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {term === 'PO' && 'Per Os - By mouth'}
                      {term === 'OD' && 'Once Daily - One time per day'}
                      {term === 'Nocte' && 'At night (before bedtime)'}
                      {/* Add more term definitions as needed */}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          )}
          
          {medication.special_instructions && (
            <div className="text-sm italic">{medication.special_instructions}</div>
          )}
        </CardContent>
        <CardFooter className="pt-1 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={handleShowDetails}
          >
            <Info className="h-3.5 w-3.5 mr-1" />
            {showDetails ? 'Hide Details' : 'History & Details'}
          </Button>
          
          {isCaregiver && (
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs" 
              onClick={() => setShowAdministerDialog(true)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Record Administration
            </Button>
          )}
        </CardFooter>
      </Card>

      {showDetails && (
        <Card className="mt-2 shadow-sm border-gray-200 bg-gray-50">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Administration History</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            {loading ? (
              <div className="py-4 text-center">Loading history...</div>
            ) : administrations.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">
                No administration records found
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {administrations.map(record => (
                  <div key={record.id} className="bg-white p-3 rounded-md shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1.5" />
                        <span className="text-sm">
                          {format(new Date(record.administered_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      By: {record.caregiver_name || 'Unknown'}
                    </div>
                    {record.notes && (
                      <div className="text-xs mt-1 italic">{record.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showAdministerDialog} onOpenChange={setShowAdministerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Medication Administration</DialogTitle>
            <DialogDescription>
              Record that {medication.name} {medication.dosage ? `(${medication.dosage})` : ''} was administered to the patient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={administerStatus === "administered" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdministerStatus("administered")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Administered
                </Button>
                <Button 
                  variant={administerStatus === "skipped" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdministerStatus("skipped")}
                >
                  <AlertCircle className="h-4 w-4 mr-2" /> Skipped
                </Button>
                <Button 
                  variant={administerStatus === "refused" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdministerStatus("refused")}
                >
                  <AlertCircle className="h-4 w-4 mr-2" /> Refused
                </Button>
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="text-sm font-medium block mb-2">
                Notes (optional)
              </label>
              <textarea 
                id="notes"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about this administration"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAdministerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdminister}>
                Record Administration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MedicationCard;
