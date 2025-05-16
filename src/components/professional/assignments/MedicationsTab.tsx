
import React, { useState, useEffect } from 'react';
import MedicationList from '../../medications/MedicationList';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pill } from 'lucide-react';
import { toast } from "sonner";

interface MedicationsTabProps {
  carePlanId: string;
  userId: string;
}

export const MedicationsTab: React.FC<MedicationsTabProps> = ({ carePlanId, userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log("MedicationsTab mounted with:", { carePlanId, userId });
  }, [carePlanId, userId]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary"/>
            <div>
              <CardTitle>Medication Management</CardTitle>
              <CardDescription>
                Record medication administrations and view medication history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MedicationList 
            carePlanId={carePlanId} 
            userRole="professional"
          />
        </CardContent>
      </Card>
    </div>
  );
};
