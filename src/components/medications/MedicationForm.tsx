
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Medication, MedicationFormData } from '@/types/medicationTypes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface MedicationFormProps {
  initialData?: Medication;
  onSubmit: (formData: MedicationFormData) => void;
  onCancel: () => void;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<MedicationFormData>({
    name: initialData?.name || '',
    dosage: initialData?.dosage || '',
    instructions: initialData?.instructions || '',
    special_instructions: initialData?.special_instructions || '',
    medication_type: initialData?.medication_type || 'prescription',
    prescription_terms: initialData?.prescription_terms || '',
    schedule: initialData?.schedule || {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      custom: ''
    }
  });
  
  const [scheduleType, setScheduleType] = useState<'standard' | 'custom'>(
    initialData?.schedule?.custom ? 'custom' : 'standard'
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (key: string, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [key]: value
      }
    }));
  };

  const medicationTypes = [
    { value: 'prescription', label: 'Prescription' },
    { value: 'otc', label: 'Over-the-counter' },
    { value: 'supplement', label: 'Supplement' },
    { value: 'herbal', label: 'Herbal' }
  ];

  const prescriptionTerms = [
    { value: 'PO', label: 'PO (By mouth)' },
    { value: 'OD', label: 'OD (Once daily)' },
    { value: 'BD', label: 'BD (Twice daily)' },
    { value: 'TID', label: 'TID (Three times daily)' },
    { value: 'QID', label: 'QID (Four times daily)' },
    { value: 'Nocte', label: 'Nocte (At night)' },
    { value: 'Mane', label: 'Mane (In the morning)' },
    { value: 'PRN', label: 'PRN (As needed)' },
    { value: 'AC', label: 'AC (Before meals)' },
    { value: 'PC', label: 'PC (After meals)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using custom schedule, remove the standard schedule options
    let finalFormData = { ...formData };
    if (scheduleType === 'custom') {
      finalFormData.schedule = {
        custom: formData.schedule.custom || ''
      };
    } else {
      // Using standard schedule, remove custom
      const { custom, ...standardSchedule } = formData.schedule;
      finalFormData.schedule = standardSchedule;
    }
    
    onSubmit(finalFormData);
  };

  const [selectedTerms, setSelectedTerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize selected terms from prescription_terms if available
    if (initialData?.prescription_terms) {
      const terms = initialData.prescription_terms.split(' ').filter(Boolean);
      const termMap: Record<string, boolean> = {};
      terms.forEach(term => {
        termMap[term] = true;
      });
      setSelectedTerms(termMap);
    }
  }, [initialData]);

  const toggleTerm = (term: string) => {
    const newSelectedTerms = { ...selectedTerms };
    newSelectedTerms[term] = !newSelectedTerms[term];
    setSelectedTerms(newSelectedTerms);
    
    // Update the prescription_terms in formData
    const activeTerms = Object.keys(newSelectedTerms).filter(key => newSelectedTerms[key]);
    const termsString = activeTerms.join(' ');
    setFormData(prev => ({ ...prev, prescription_terms: termsString }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Medication Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleInputChange} 
          placeholder="Enter medication name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="dosage">Dosage</Label>
        <Input 
          id="dosage" 
          name="dosage" 
          value={formData.dosage} 
          onChange={handleInputChange} 
          placeholder="e.g., 100mg, 5ml"
        />
      </div>
      
      <div>
        <Label htmlFor="medication_type">Medication Type</Label>
        <Select 
          value={formData.medication_type} 
          onValueChange={(value) => handleSelectChange('medication_type', value)}
        >
          <SelectTrigger id="medication_type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {medicationTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="instructions">Instructions</Label>
        <Input 
          id="instructions" 
          name="instructions" 
          value={formData.instructions} 
          onChange={handleInputChange} 
          placeholder="e.g., 1 in morning"
        />
      </div>
      
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Schedule</h3>
        
        <Tabs value={scheduleType} onValueChange={(value) => setScheduleType(value as 'standard' | 'custom')}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="standard">Standard Times</TabsTrigger>
            <TabsTrigger value="custom">Custom Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="morning" 
                  checked={formData.schedule.morning} 
                  onCheckedChange={(checked) => handleScheduleChange('morning', checked === true)}
                />
                <Label htmlFor="morning">Morning</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="afternoon" 
                  checked={formData.schedule.afternoon} 
                  onCheckedChange={(checked) => handleScheduleChange('afternoon', checked === true)}
                />
                <Label htmlFor="afternoon">Afternoon</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="evening" 
                  checked={formData.schedule.evening} 
                  onCheckedChange={(checked) => handleScheduleChange('evening', checked === true)}
                />
                <Label htmlFor="evening">Evening</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="night" 
                  checked={formData.schedule.night} 
                  onCheckedChange={(checked) => handleScheduleChange('night', checked === true)}
                />
                <Label htmlFor="night">Night</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="pt-3">
            <div>
              <Label htmlFor="customSchedule">Custom Schedule Instructions</Label>
              <Textarea 
                id="customSchedule" 
                value={formData.schedule.custom || ''}
                onChange={(e) => handleScheduleChange('custom', e.target.value)}
                placeholder="e.g., Take 1 tablet 30 minutes before breakfast and 1 tablet at bedtime"
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Prescription Terms</h3>
        <p className="text-sm text-muted-foreground">Select all terms that apply to this medication</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {prescriptionTerms.map((term) => (
            <Button
              key={term.value}
              type="button"
              variant={selectedTerms[term.value] ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => toggleTerm(term.value)}
            >
              {selectedTerms[term.value] && <Check className="h-3 w-3 mr-1.5" />}
              {term.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea 
          id="special_instructions" 
          name="special_instructions" 
          value={formData.special_instructions} 
          onChange={handleInputChange}
          placeholder="Any additional notes about this medication"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Medication' : 'Add Medication'}
        </Button>
      </div>
    </form>
  );
};

export default MedicationForm;
