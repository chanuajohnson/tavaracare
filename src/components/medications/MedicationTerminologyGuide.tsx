
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const MedicationTerminologyGuide: React.FC = () => {
  const terminologies = [
    { term: 'PO', definition: 'Per Os - By mouth', category: 'route' },
    { term: 'OD', definition: 'Once Daily - One time per day', category: 'frequency' },
    { term: 'BD/BID', definition: 'Bis in Die - Twice per day', category: 'frequency' },
    { term: 'TID', definition: 'Ter in Die - Three times per day', category: 'frequency' },
    { term: 'QID', definition: 'Quater in Die - Four times per day', category: 'frequency' },
    { term: 'Nocte', definition: 'At night (taken before bedtime)', category: 'timing' },
    { term: 'Mane', definition: 'In the morning', category: 'timing' },
    { term: 'PRN', definition: 'Pro Re Nata - As needed', category: 'special' },
    { term: 'AC', definition: 'Ante Cibum - Before meals', category: 'timing' },
    { term: 'PC', definition: 'Post Cibum - After meals', category: 'timing' },
    { term: 'SL', definition: 'Sublingual - Under the tongue', category: 'route' },
    { term: 'IV', definition: 'Intravenous - Into the vein', category: 'route' },
    { term: 'IM', definition: 'Intramuscular - Into the muscle', category: 'route' },
    { term: 'SC', definition: 'Subcutaneous - Under the skin', category: 'route' },
    { term: 'NPO', definition: 'Nil Per Os - Nothing by mouth', category: 'special' },
    { term: 'mg', definition: 'Milligram - Unit of weight', category: 'unit' },
    { term: 'mcg', definition: 'Microgram - Unit of weight', category: 'unit' },
    { term: 'mL', definition: 'Milliliter - Unit of volume', category: 'unit' },
  ];

  // Group by category
  const categorizedTerms = terminologies.reduce((acc: Record<string, typeof terminologies>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    route: 'Administration Routes',
    frequency: 'Frequency Terms',
    timing: 'Timing Terms',
    special: 'Special Instructions',
    unit: 'Measurement Units'
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Medication Terminology Guide</CardTitle>
        <CardDescription>Common medical abbreviations and terms for prescriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {Object.entries(categorizedTerms).map(([category, terms]) => (
            <div key={category} className="mb-6">
              <h3 className="font-medium text-lg mb-2">{categoryLabels[category] || category}</h3>
              <div className="space-y-3">
                {terms.map((item) => (
                  <div key={item.term} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-base py-0.5 px-2">
                        {item.term}
                      </Badge>
                      <span className="text-sm">{item.definition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MedicationTerminologyGuide;
