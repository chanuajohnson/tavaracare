import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import {
  CostCategory,
  CostLineItem,
  Recurrence,
  normalizeToWeekly,
  categoryWeeklyTotal,
  frameworkWeeklyTotal,
  RECURRENCE_LABELS,
} from '@/hooks/admin/operatingCostFramework';

interface Props {
  framework: CostCategory[];
  onChange: (next: CostCategory[]) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  software: '💻',
  devices: '🖥️',
  founder_admin: '👤',
  care_ops: '🩺',
  marketing: '📣',
  professional: '⚖️',
  banking: '🏦',
  statutory: '🇹🇹',
};

function fmt(n: number) {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function OperatingCostConfig({ framework, onChange }: Props) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['software', 'care_ops', 'statutory']));

  const toggleCat = (key: string) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const updateItem = (catKey: string, itemKey: string, patch: Partial<CostLineItem>) => {
    const next = framework.map(cat => {
      if (cat.key !== catKey) return cat;
      return {
        ...cat,
        items: cat.items.map(it => (it.key === itemKey ? { ...it, ...patch } : it)),
      };
    });
    onChange(next);
  };

  const totalWeekly = frameworkWeeklyTotal(framework);
  const totalMonthly = totalWeekly * 4.333;
  const totalYearly = totalWeekly * 52;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Operating Cost Framework — Chart of Accounts</span>
          <div className="flex flex-wrap gap-2 text-xs font-normal">
            <Badge variant="outline">{fmt(totalWeekly)}/wk</Badge>
            <Badge variant="outline">{fmt(totalMonthly)}/mo</Badge>
            <Badge variant="outline">{fmt(totalYearly)}/yr run-rate</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2 mb-2">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            All amounts auto-normalize to weekly for unit economics. T&T statutory items
            (Business Levy 0.6%, Green Fund 0.3%) auto-calculate from gross revenue.
          </span>
        </div>

        {framework.map(cat => {
          const isOpen = openCats.has(cat.key);
          const catWeekly = categoryWeeklyTotal(cat);
          return (
            <Collapsible key={cat.key} open={isOpen} onOpenChange={() => toggleCat(cat.key)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 rounded border">
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="text-base">{CATEGORY_ICONS[cat.key] || '📊'}</span>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{cat.label}</div>
                      <div className="text-[11px] text-muted-foreground">{cat.description}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium">
                    {fmt(catWeekly)}<span className="text-muted-foreground">/wk</span>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-x border-b rounded-b -mt-px p-3 space-y-2 bg-background">
                  {cat.key === 'founder_admin' && (
                    <div className="flex items-start gap-2 text-[11px] text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>Founder time is logged for true cost accounting. Tax-deductible only if paid as director's fees per BIR rules.</span>
                    </div>
                  )}
                  {cat.key === 'care_ops' && (
                    <div className="flex items-start gap-2 text-[11px] text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>Log as contractor stipend / training pay. Never label as "wages" or "salary" — Tavara is a coordination platform, not an employer of caregivers.</span>
                    </div>
                  )}
                  {cat.items.map(item => {
                    const weekly = normalizeToWeekly(item);
                    const isAutoCalc = !!item.autoCalcPercentOfRevenue;
                    return (
                      <div key={item.key} className="grid grid-cols-12 gap-2 items-start py-1.5 border-b border-dashed last:border-0">
                        <div className="col-span-12 sm:col-span-5">
                          <Label className="text-xs text-foreground">{item.label}</Label>
                          {item.notes && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{item.notes}</div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {item.taxDeductible && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-green-300 text-green-700">
                                T&T deductible
                              </Badge>
                            )}
                            {isAutoCalc && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-blue-300 text-blue-700">
                                Auto-calc
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="col-span-7 sm:col-span-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={isAutoCalc ? '' : item.amount}
                              placeholder={isAutoCalc ? 'auto' : '0'}
                              disabled={isAutoCalc}
                              onChange={e => updateItem(cat.key, item.key, { amount: parseFloat(e.target.value) || 0 })}
                              className="pl-6 h-8 text-sm"
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <Select
                            value={item.recurrence}
                            disabled={isAutoCalc}
                            onValueChange={(v: Recurrence) => updateItem(cat.key, item.key, { recurrence: v })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">/week</SelectItem>
                              <SelectItem value="monthly">/month</SelectItem>
                              <SelectItem value="yearly">/year</SelectItem>
                              <SelectItem value="one_time">one-time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 sm:col-span-2 text-right text-xs pt-2 text-muted-foreground">
                          {isAutoCalc
                            ? `${item.autoCalcPercentOfRevenue}% rev`
                            : `${fmt(weekly)}/wk`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
