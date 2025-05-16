
import React, { useState, useEffect } from 'react';
import MedicationList from './MedicationList';
import MedicationTerminologyGuide from './MedicationTerminologyGuide';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { profileService } from '@/services/profileService';

interface MedicationManagementTabProps {
  carePlanId: string;
  familyId: string;
}

const MedicationManagementTab: React.FC<MedicationManagementTabProps> = ({ carePlanId, familyId }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'family' | 'professional'>('family');
  
  useEffect(() => {
    // Determine user role based on user ID
    if (user) {
      // Default to family
      let role: 'family' | 'professional' = 'family';
      
      // Check if user is the family member who owns this plan
      if (user.id === familyId) {
        role = 'family';
      } else {
        // If not the family, check if user is a professional
        profileService.getCurrentUserProfile().then(profile => {
          if (profile && profile.role === 'professional') {
            setUserRole('professional');
          }
        });
      }
      
      setUserRole(role);
    }
  }, [user, familyId]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MedicationList carePlanId={carePlanId} userRole={userRole} />
        </div>
        <div className="md:col-span-1">
          <Card>
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-4">Medical Terminology Guide</AccordionTrigger>
                <AccordionContent className="px-0 pt-0">
                  <MedicationTerminologyGuide />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
          
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-700 mb-2">About Medication Management</h3>
            <p className="text-sm text-blue-600">
              This section allows you to track all medications for the care recipient. 
              Family members can add, edit, and view medications, while care team members 
              can record when medications are administered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationManagementTab;
