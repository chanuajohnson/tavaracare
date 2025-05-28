
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";
import { CareNeedsFormData } from "./types";

interface DailyLivingTasksSectionProps {
  formData: CareNeedsFormData;
  updateFormData: (field: string, value: any) => void;
}

export const DailyLivingTasksSection = ({ formData, updateFormData }: DailyLivingTasksSectionProps) => {
  const adlTasks = [
    { key: 'assistance_bathing', label: 'Assistance with bathing' },
    { key: 'assistance_dressing', label: 'Dressing / changing clothes' },
    { key: 'assistance_toileting', label: 'Toileting / incontinence care' },
    { key: 'assistance_oral_care', label: 'Oral care / dentures' },
    { key: 'assistance_feeding', label: 'Feeding / meal prep' },
    { key: 'assistance_mobility', label: 'Assistance walking or repositioning' },
    { key: 'assistance_medication', label: 'Medication reminders' },
    { key: 'assistance_companionship', label: 'Companionship / supervision' },
    { key: 'assistance_naps', label: 'Help with naps or rest periods' }
  ];

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          🛌 Daily Living Tasks (ADLs)
        </CardTitle>
        <p className="text-sm text-gray-600">Check any that are required regularly:</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adlTasks.map(item => (
          <div key={item.key} className="flex items-center space-x-2">
            <Checkbox
              id={item.key}
              checked={formData[item.key as keyof CareNeedsFormData] as boolean}
              onCheckedChange={(checked) => updateFormData(item.key, checked)}
            />
            <Label htmlFor={item.key}>{item.label}</Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
