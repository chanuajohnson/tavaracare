
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CareNeedsFormData, daysOfWeek } from "./types";

interface BasicInformationSectionProps {
  formData: CareNeedsFormData;
  updateFormData: (field: string, value: any) => void;
  handleDayToggle: (day: string, checked: boolean) => void;
}

export const BasicInformationSection = ({ 
  formData, 
  updateFormData, 
  handleDayToggle 
}: BasicInformationSectionProps) => {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="care_recipient_name">Care Recipient Name *</Label>
            <Input
              id="care_recipient_name"
              value={formData.care_recipient_name}
              onChange={(e) => updateFormData('care_recipient_name', e.target.value)}
              placeholder="Full name of care recipient"
              required
            />
          </div>
          <div>
            <Label htmlFor="primary_contact_name">Primary Contact *</Label>
            <Input
              id="primary_contact_name"
              value={formData.primary_contact_name}
              onChange={(e) => updateFormData('primary_contact_name', e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary_contact_phone">Primary Contact Phone *</Label>
            <Input
              id="primary_contact_phone"
              value={formData.primary_contact_phone}
              onChange={(e) => updateFormData('primary_contact_phone', e.target.value)}
              placeholder="Your phone number"
              required
            />
          </div>
          <div>
            <Label htmlFor="care_location">Care Location *</Label>
            <Input
              id="care_location"
              value={formData.care_location}
              onChange={(e) => updateFormData('care_location', e.target.value)}
              placeholder="Address where care will be provided"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preferred_shift_start">Preferred Shift Start Time</Label>
            <Input
              id="preferred_shift_start"
              type="time"
              value={formData.preferred_shift_start}
              onChange={(e) => updateFormData('preferred_shift_start', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="preferred_shift_end">Preferred Shift End Time</Label>
            <Input
              id="preferred_shift_end"
              type="time"
              value={formData.preferred_shift_end}
              onChange={(e) => updateFormData('preferred_shift_end', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label>Days of Week</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {daysOfWeek.map(day => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={formData.preferred_days.includes(day.value)}
                  onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                />
                <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
