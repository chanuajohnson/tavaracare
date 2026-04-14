import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OperatingCosts, totalOperatingCost } from '@/hooks/admin/useUnitEconomics';

interface Props {
  costs: OperatingCosts;
  onChange: (costs: OperatingCosts) => void;
}

const COST_LABELS: { key: keyof OperatingCosts; label: string }[] = [
  { key: 'careCoordination', label: 'Care Coordination' },
  { key: 'replacementBuffer', label: 'Replacement / Backup Buffer' },
  { key: 'paymentProcessing', label: 'Payment Processing Fees' },
  { key: 'adminDocumentation', label: 'Admin & Documentation' },
  { key: 'platformOverhead', label: 'Platform & Infrastructure' },
  { key: 'salesAcquisition', label: 'Sales & Acquisition' },
];

export function OperatingCostConfig({ costs, onChange }: Props) {
  const handleChange = (key: keyof OperatingCosts, value: string) => {
    const num = parseFloat(value) || 0;
    onChange({ ...costs, [key]: num });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Operating Cost Assumptions (per client/week)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COST_LABELS.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={costs[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  className="pl-6 h-8 text-sm"
                  min={0}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total weekly operating cost</span>
          <span className="text-sm font-bold">${totalOperatingCost(costs).toLocaleString()}/week</span>
        </div>
      </CardContent>
    </Card>
  );
}
