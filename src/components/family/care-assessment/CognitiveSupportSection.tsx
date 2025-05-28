
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Brain } from "lucide-react";
import { CareNeedsFormData } from "./types";

interface CognitiveSupportSectionProps {
  formData: CareNeedsFormData;
  updateFormData: (field: string, value: any) => void;
}

export const CognitiveSupportSection = ({ formData, updateFormData }: CognitiveSupportSectionProps) => {
  const cognitiveItems = [
    { key: 'dementia_redirection', label: 'Dementia-related redirection' },
    { key: 'memory_reminders', label: 'Memory reminders (meals, meds, hygiene)' },
    { key: 'gentle_engagement', label: 'Gentle engagement (music, puzzles, talk)' },
    { key: 'wandering_prevention', label: 'Prevention of wandering or risk behavior' }
  ];

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          🧠 Cognitive / Memory Support
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cognitiveItems.map(item => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                onCheckedChange={(checked) => updateFormData(item.key, checked)}
              />
              <Label htmlFor={item.key}>{item.label}</Label>
            </div>
          ))}
        </div>
        <div>
          <Label htmlFor="triggers_soothing_techniques">Describe any known triggers or soothing techniques:</Label>
          <Textarea
            id="triggers_soothing_techniques"
            value={formData.triggers_soothing_techniques}
            onChange={(e) => updateFormData('triggers_soothing_techniques', e.target.value)}
            placeholder="e.g. Gets confused after sunset, responds well to soft music"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
