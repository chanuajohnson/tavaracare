import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Medication, MedicationAdministration } from '@/types/medicationTypes';
import { Pill, Clock, Edit, Trash2, AlertCircle, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { medicationService } from '@/services/medicationService';
import { useAuth } from '@/components/providers/AuthProvider';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
  onAdministrationRecorded: () => void;
  isCaregiver: boolean;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ 
  medication, 
  onEdit, 
  onDelete,
  onAdministrationRecorded,
  isCaregiver
}) => {
  const [expanded, setExpanded] = useState(false);
  const [administrations, setAdministrations] = useState<MedicationAdministration[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAdministerDialog, setShowAdministerDialog] = useState(false);
  const [administerStatus, setAdministerStatus] = useState<'administered' | 'skipped' | 'refused'>('administered');
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  
  const toggleExpanded = async () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    if (newExpandedState && administrations.length === 0) {
      setLoadingHistory(true);
      try {
        const data = await medicationService.fetchAdministrations(medication.id);
        setAdministrations(data);
      } catch (err) {
        console.error('Error loading medication history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const handleAdminister = async () => {
    if (!user) return;
    
    const administration = {
      medication_id: medication.id,
      administered_by: user.id,
      administered_at: new Date().toISOString(),
      status: administerStatus,
      notes: notes.trim() || null
    };
    
    const result = await medicationService.recordAdministration(administration);
    if (result) {
      setAdministrations(prev => [result, ...prev]);
      setNotes('');
      setShowAdministerDialog(false);
      onAdministrationRecorded();
    }
  };

  const getScheduleDisplay = () => {
    const schedule = medication.schedule;
    if (!schedule) return 'No schedule set';
    
    if (schedule.custom) return schedule.custom;
    
    const times = [];
    if (schedule.morning) times.push('Morning');
    if (schedule.afternoon) times.push('Afternoon');
    if (schedule.evening) times.push('Evening');
    if (schedule.night) times.push('Night');
    
    return times.length > 0 ? times.join(', ') : 'No schedule set';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'administered':
        return <Badge className="bg-green-500">Administered</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-500">Skipped</Badge>;
      case 'refused':
        return <Badge className="bg-red-500">Refused</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-2 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-2 w-4/5">
            <Pill className="h-5 w-5 mt-1.5" />
            <div>
              <h3 className="font-medium text-lg">{medication.name}</h3>
              <p className="text-sm text-muted-foreground">
                {medication.dosage && <span className="font-medium">{medication.dosage}</span>}
                {medication.dosage && medication.medication_type && <span> · </span>}
                {medication.medication_type && (
                  <span className="capitalize">{medication.medication_type}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {!isCaregiver && (
              <>
                <Button variant="ghost" size="icon" onClick={() => onEdit(medication)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(medication.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={toggleExpanded}>
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <p className="text-muted-foreground">Instructions</p>
            <p>{medication.instructions || 'None specified'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Schedule</p>
            <p className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{getScheduleDisplay()}</span>
            </p>
          </div>
        </div>

        {isCaregiver && (
          <div className="mt-2">
            <Button 
              className="w-full"
              onClick={() => setShowAdministerDialog(true)}
              variant="default"
            >
              Record Administration
            </Button>
          </div>
        )}
        
        {expanded && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="font-medium mb-2">Administration History</h4>
            
            {loadingHistory ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="mt-1 text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : administrations.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="mt-1 text-sm text-muted-foreground">No administration records found</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-2">
                  {administrations.map(admin => (
                    <div key={admin.id} className="bg-muted/30 p-2 rounded-md">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="text-sm font-medium">
                            {format(new Date(admin.administered_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        {getStatusBadge(admin.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        By: {admin.caregiver_name || 'Unknown'}
                      </div>
                      {admin.notes && (
                        <div className="mt-1 text-sm">
                          <span className="italic">{admin.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
        
        {medication.special_instructions && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">Special Instructions</p>
            <p className="text-sm">{medication.special_instructions}</p>
          </div>
        )}
      </CardContent>
      
      <Dialog open={showAdministerDialog} onOpenChange={setShowAdministerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Medication Administration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div>
              <h3 className="font-medium">{medication.name} {medication.dosage}</h3>
              <p className="text-sm text-muted-foreground">{medication.instructions}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select 
                value={administerStatus} 
                onValueChange={(val) => setAdministerStatus(val as 'administered' | 'skipped' | 'refused')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administered">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Administered
                    </div>
                  </SelectItem>
                  <SelectItem value="skipped">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-amber-500" />
                      Skipped
                    </div>
                  </SelectItem>
                  <SelectItem value="refused">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      Refused
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <Textarea 
                placeholder="Add any notes about this administration" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setShowAdministerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdminister}>
                Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MedicationCard;
