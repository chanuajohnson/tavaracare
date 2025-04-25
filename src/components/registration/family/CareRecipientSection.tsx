
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface CareRecipientProps {
  careRecipientName: string;
  relationship: string;
  careTypes: string[];
  caregiverType: string;
  onCareRecipientNameChange: (value: string) => void;
  onRelationshipChange: (value: string) => void;
  onCareTypesChange: (value: string) => void;
  onCaregiverTypeChange: (value: string) => void;
}

export const CareRecipientSection: React.FC<CareRecipientProps> = ({
  careRecipientName,
  relationship,
  careTypes,
  caregiverType,
  onCareRecipientNameChange,
  onRelationshipChange,
  onCareTypesChange,
  onCaregiverTypeChange,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Care Recipient Information</CardTitle>
        <CardDescription>
          Tell us about the person you are caring for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="careRecipientName">Care Recipient's Full Name – Name of the person needing care *</Label>
          <Input 
            id="careRecipientName" 
            placeholder="Care Recipient Name" 
            value={careRecipientName} 
            onChange={(e) => onCareRecipientNameChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship to Care Recipient *</Label>
          <Select value={relationship} onValueChange={onRelationshipChange}>
            <SelectTrigger id="relationship">
              <SelectValue placeholder="Select your relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Child">Child</SelectItem>
              <SelectItem value="Spouse">Spouse</SelectItem>
              <SelectItem value="Grandparent">Grandparent</SelectItem>
              <SelectItem value="Sibling">Sibling</SelectItem>
              <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Primary Care Type Needed – What type of care is needed? (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { id: 'care-inhome', label: '🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)', value: 'In-Home Care' },
              { id: 'care-medical', label: '🏥 Medical Support (Post-surgery, Chronic Condition Management, Hospice)', value: 'Medical Support' },
              { id: 'care-therapeutic', label: '🌱 Therapeutic Support (Physical Therapy, Occupational Therapy, Speech Therapy)', value: 'Therapeutic Support' },
              { id: 'care-specialneeds', label: '🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)', value: 'Special Needs Support' },
              { id: 'care-cognitive', label: '🧠 Cognitive & Memory Care (Alzheimer\'s, Dementia, Parkinson\'s)', value: 'Cognitive & Memory Care' },
              { id: 'care-mobility', label: '♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)', value: 'Mobility Assistance' },
              { id: 'care-medication', label: '💊 Medication Management (Daily Medications, Insulin, Medical Equipment)', value: 'Medication Management' },
              { id: 'care-nutrition', label: '🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)', value: 'Nutritional Assistance' },
              { id: 'care-household', label: '🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)', value: 'Household Assistance' }
            ].map((item) => (
              <div key={item.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={item.id} 
                  checked={careTypes.includes(item.value)}
                  onCheckedChange={() => onCareTypesChange(item.value)}
                  className="mt-1"
                />
                <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="caregiverType">Preferred Caregiver Type – Do you prefer care from:</Label>
          <Select value={caregiverType} onValueChange={onCaregiverTypeChange}>
            <SelectTrigger id="caregiverType">
              <SelectValue placeholder="Select Caregiver Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Certified Agency">🏥 Certified Agency</SelectItem>
              <SelectItem value="Independent Caregiver">🏠 Independent Caregiver</SelectItem>
              <SelectItem value="Either">👩‍⚕️ Either is fine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
