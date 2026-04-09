
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { ChecklistSection, MEDICATION_ITEM_TEXT } from './checklistSections';

interface ChecklistSectionCardProps {
  section: ChecklistSection;
  sectionIdx: number;
  sectionCompleted: number;
  allSectionChecked: boolean;
  isChecked: (sIdx: number, iIdx: number) => boolean;
  toggleItem: (sIdx: number, iIdx: number) => void;
  toggleSection: (sIdx: number) => void;
  carePlanId?: string;
}

export const ChecklistSectionCard: React.FC<ChecklistSectionCardProps> = ({
  section,
  sectionIdx,
  sectionCompleted,
  allSectionChecked,
  isChecked,
  toggleItem,
  toggleSection,
  carePlanId,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`select-all-section-${sectionIdx}`}
              checked={allSectionChecked}
              onCheckedChange={() => toggleSection(sectionIdx)}
            />
            <Label htmlFor={`select-all-section-${sectionIdx}`} className="cursor-pointer">
              <CardTitle className="text-base">{section.title}</CardTitle>
            </Label>
          </div>
          <Badge variant={sectionCompleted === section.items.length ? 'default' : 'outline'} className="text-xs">
            {sectionCompleted}/{section.items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {section.items.map((item, iIdx) => {
          const isMedItem = item === MEDICATION_ITEM_TEXT;
          return (
            <div key={iIdx} className="flex items-center gap-3 py-1">
              <Checkbox
                id={`check-${sectionIdx}-${iIdx}`}
                checked={isChecked(sectionIdx, iIdx)}
                onCheckedChange={() => toggleItem(sectionIdx, iIdx)}
              />
              <Label
                htmlFor={`check-${sectionIdx}-${iIdx}`}
                className={`font-normal cursor-pointer flex-1 ${isChecked(sectionIdx, iIdx) ? 'line-through text-muted-foreground' : ''}`}
              >
                {item}
              </Label>
              {isMedItem && carePlanId && (
                <a
                  href={`/family/care-management/${carePlanId}?tab=medications`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 shrink-0"
                  title="Open Medication Management"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
