
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, PlusCircle, Pill, Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { medicationService } from '@/services/medicationService';
import { Medication } from '@/types/medicationTypes';

interface MedicationListProps {
  carePlanId: string;
  userRole?: 'family' | 'professional' | 'admin';
}

const MedicationList: React.FC<MedicationListProps> = ({ carePlanId, userRole = 'family' }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, [carePlanId]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      console.log(`Loading medications for care plan: ${carePlanId}`);
      const data = await medicationService.fetchMedications(carePlanId);
      console.log(`Loaded ${data.length} medications for care plan: ${carePlanId}`);
      setMedications(data);
    } catch (error) {
      console.error('Error loading medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (schedule?: any) => {
    if (!schedule) return 'Not specified';
    
    const times = [];
    
    if (schedule.morning) times.push('Morning');
    if (schedule.afternoon) times.push('Afternoon');
    if (schedule.evening) times.push('Evening');
    if (schedule.night) times.push('Night');
    
    if (times.length > 0) return times.join(', ');
    if (schedule.custom) return schedule.custom;
    if (schedule.times?.length) return schedule.times.join(', ');
    
    return 'As needed';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-8">
        <Pill className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No medications added yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {userRole === 'family' 
            ? 'Add medications to track and manage them for this care plan' 
            : 'The family has not added any medications to this care plan yet'}
        </p>
        
        {userRole === 'family' && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medications.map((medication) => (
        <Card key={medication.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    {medication.name}
                  </h3>
                  {medication.dosage && (
                    <p className="text-sm text-gray-600">
                      {medication.dosage}
                    </p>
                  )}
                </div>
                {medication.medication_type && (
                  <Badge variant="outline">{medication.medication_type}</Badge>
                )}
              </div>
              
              {medication.instructions && (
                <div className="mt-2">
                  <p className="text-sm">{medication.instructions}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-y-2 text-sm text-gray-600">
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  <span>
                    {medication.schedule?.days?.length 
                      ? medication.schedule.days.join(', ') 
                      : 'Every day'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{formatSchedule(medication.schedule)}</span>
                </div>
              </div>
              
              {medication.special_instructions && (
                <div className="mt-2 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 text-amber-500 mt-0.5" />
                  <p className="text-sm">{medication.special_instructions}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-between items-center pt-3 border-t">
                {userRole === 'professional' ? (
                  <Button variant="outline" size="sm">
                    Record Administration
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MedicationList;
