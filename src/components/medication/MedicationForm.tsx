
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pill, Plus, Trash2, Clock } from "lucide-react";
import { Medication, medicationService } from "@/services/medicationService";
import { toast } from "sonner";

interface MedicationFormProps {
  carePlanId: string;
  medication?: Medication;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
}

interface ScheduleTime {
  time: string;
  withFood?: boolean;
  beforeBed?: boolean;
}

export const MedicationForm = ({
  carePlanId,
  medication,
  onSave,
  onCancel
}: MedicationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    medication_type: '',
    instructions: '',
    prescription_terms: '',
    special_instructions: '',
  });
  
  const [scheduleData, setScheduleData] = useState({
    frequency: 'daily', // daily, weekly, as_needed
    times: [] as ScheduleTime[],
    startDate: '',
    endDate: '',
    asNeeded: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data if editing
  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '',
        dosage: medication.dosage || '',
        medication_type: medication.medication_type || '',
        instructions: medication.instructions || '',
        prescription_terms: medication.prescription_terms || '',
        special_instructions: medication.special_instructions || '',
      });

      // Parse schedule if exists
      if (medication.schedule) {
        setScheduleData({
          frequency: medication.schedule.frequency || 'daily',
          times: medication.schedule.times || [],
          startDate: medication.schedule.startDate || '',
          endDate: medication.schedule.endDate || '',
          asNeeded: medication.schedule.asNeeded || false
        });
      }
    }
  }, [medication]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleChange = (field: string, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addScheduleTime = () => {
    setScheduleData(prev => ({
      ...prev,
      times: [...prev.times, { time: '08:00', withFood: false, beforeBed: false }]
    }));
  };

  const removeScheduleTime = (index: number) => {
    setScheduleData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateScheduleTime = (index: number, field: string, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      times: prev.times.map((time, i) => 
        i === index ? { ...time, [field]: value } : time
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Medication name is required");
      return;
    }

    setIsLoading(true);

    try {
      const medicationData = {
        ...formData,
        care_plan_id: carePlanId,
        schedule: scheduleData.asNeeded ? { asNeeded: true } : scheduleData
      };

      let result;
      if (medication?.id) {
        result = await medicationService.updateMedication(medication.id, medicationData);
      } else {
        result = await medicationService.createMedication(medicationData);
      }

      if (result) {
        onSave(result);
      }
    } catch (error) {
      console.error("Error saving medication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          {medication ? 'Edit Medication' : 'Add New Medication'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Lisinopril"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  placeholder="e.g., 10mg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medication_type">Medication Type</Label>
              <Select value={formData.medication_type} onValueChange={(value) => handleInputChange('medication_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medication type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="over_the_counter">Over-the-Counter</SelectItem>
                  <SelectItem value="supplement">Supplement</SelectItem>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="herbal">Herbal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="e.g., Take with food, avoid alcohol"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                placeholder="Any special handling or administration notes"
                rows={2}
              />
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={scheduleData.asNeeded}
                onCheckedChange={(checked) => handleScheduleChange('asNeeded', checked)}
              />
              <Label>As needed only (PRN)</Label>
            </div>

            {!scheduleData.asNeeded && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={scheduleData.frequency} onValueChange={(value) => handleScheduleChange('frequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Administration Times</Label>
                    <Button type="button" onClick={addScheduleTime} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time
                    </Button>
                  </div>
                  
                  {scheduleData.times.map((scheduleTime, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded">
                      <Clock className="h-4 w-4" />
                      <Input
                        type="time"
                        value={scheduleTime.time}
                        onChange={(e) => updateScheduleTime(index, 'time', e.target.value)}
                        className="w-32"
                      />
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={scheduleTime.withFood}
                            onCheckedChange={(checked) => updateScheduleTime(index, 'withFood', checked)}
                          />
                          <Label className="text-sm">With food</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={scheduleTime.beforeBed}
                            onCheckedChange={(checked) => updateScheduleTime(index, 'beforeBed', checked)}
                          />
                          <Label className="text-sm">Before bed</Label>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => removeScheduleTime(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={scheduleData.startDate}
                      onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={scheduleData.endDate}
                      onChange={(e) => handleScheduleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : (medication ? 'Update Medication' : 'Add Medication')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
