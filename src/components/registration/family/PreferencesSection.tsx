
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreferencesSectionProps {
  caregiverPreferences: string;
  emergencyContact: string;
  budgetPreferences: string;
  preferredContactMethod: string;
  additionalNotes: string;
  onCaregiverPreferencesChange: (value: string) => void;
  onEmergencyContactChange: (value: string) => void;
  onBudgetPreferencesChange: (value: string) => void;
  onPreferredContactMethodChange: (value: string) => void;
  onAdditionalNotesChange: (value: string) => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  caregiverPreferences,
  emergencyContact,
  budgetPreferences,
  preferredContactMethod,
  additionalNotes,
  onCaregiverPreferencesChange,
  onEmergencyContactChange,
  onBudgetPreferencesChange,
  onPreferredContactMethodChange,
  onAdditionalNotesChange,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>🟡 Additional Preferences</CardTitle>
        <CardDescription>
          Help us better understand your specific needs and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caregiverPreferences">Caregiver Preferences – Gender, Age, Language, Experience Level</Label>
          <Textarea 
            id="caregiverPreferences" 
            placeholder="Please specify any preferences regarding your caregiver" 
            value={caregiverPreferences} 
            onChange={(e) => onCaregiverPreferencesChange(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact Details – Secondary contact in case of urgent needs</Label>
          <Input 
            id="emergencyContact" 
            placeholder="Name, relationship, phone number" 
            value={emergencyContact} 
            onChange={(e) => onEmergencyContactChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetPreferences">Budget Preferences – Expected hourly or monthly care budget</Label>
          <Input 
            id="budgetPreferences" 
            placeholder="Your budget for care services" 
            value={budgetPreferences} 
            onChange={(e) => onBudgetPreferencesChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
          <Select value={preferredContactMethod} onValueChange={onPreferredContactMethodChange}>
            <SelectTrigger id="preferredContactMethod">
              <SelectValue placeholder="Select Contact Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea 
            id="additionalNotes" 
            placeholder="Any other information you would like to share" 
            value={additionalNotes} 
            onChange={(e) => onAdditionalNotesChange(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
