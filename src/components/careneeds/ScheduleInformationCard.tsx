
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleInformationCardProps {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const ScheduleInformationCard: React.FC<ScheduleInformationCardProps> = ({ 
  formData, 
  onChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferred Schedule</CardTitle>
        <CardDescription>Let us know your preferred caregiving schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="preferred_time_start">Preferred Start Time</Label>
          <Input
            id="preferred_time_start"
            type="time"
            value={formData.preferred_time_start || ''}
            onChange={(e) => onChange('preferred_time_start', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="preferred_time_end">Preferred End Time</Label>
          <Input
            id="preferred_time_end"
            type="time"
            value={formData.preferred_time_end || ''}
            onChange={(e) => onChange('preferred_time_end', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleInformationCard;
