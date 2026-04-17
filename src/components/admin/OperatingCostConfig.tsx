import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, AlertTriangle, Info, Plus, Trash2, X } from 'lucide-react';
import {
  CostCategory,
  CostLineItem,
  Recurrence,
  normalizeToWeekly,
  categoryWeeklyTotal,
  frameworkWeeklyTotal,
  weeklyByLayer,
  getCategoryLayer,
  addCustomItem,
  removeItem,
  CATEGORY_HINTS,
} from '@/hooks/admin/operatingCostFramework';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wrench, Building2, HelpCircle } from 'lucide-react';

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

interface AddFormState {
  label: string;
  amount: string;
  recurrence: Recurrence;
  taxDeductible: boolean;
  notes: string;
}

const EMPTY_FORM: AddFormState = {
  label: '',
  amount: '',
  recurrence: 'monthly',
  taxDeductible: true,
  notes: '',
};

export function OperatingCostConfig({ framework, onChange }: Props) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['software', 'care_ops', 'statutory']));
  const [addingCat, setAddingCat] = useState<string | null>(null);
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);

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

  const handleDelete = (catKey: string, itemKey: string) => {
    onChange(removeItem(framework, catKey, itemKey));
  };

  const handleAddSubmit = (catKey: string) => {
    if (!form.label.trim()) return;
    onChange(
      addCustomItem(framework, catKey, {
        label: form.label.trim(),
        amount: parseFloat(form.amount) || 0,
        recurrence: form.recurrence,
        taxDeductible: form.taxDeductible,
        notes: form.notes.trim() || undefined,
      })
    );
    setForm(EMPTY_FORM);
    setAddingCat(null);
  };

  const totalWeekly = frameworkWeeklyTotal(framework);
  const totalMonthly = totalWeekly * 4.333;
  const totalYearly = totalWeekly * 52;
  const layered = weeklyByLayer(framework);

  const careOpsCats = framework.filter(c => getCategoryLayer(c) === 'care_ops');
  const platformCats = framework.filter(c => getCategoryLayer(c) === 'platform');

  const renderCategory = (cat: CostCategory) => {
    const isOpen = openCats.has(cat.key);
    const catWeekly = categoryWeeklyTotal(cat);
    const isAdding = addingCat === cat.key;
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
                          <div className="flex gap-1 mt-1 flex-wrap">
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
                            {item.isCustom && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-purple-300 text-purple-700">
                                Custom
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
                        <div className="col-span-2 sm:col-span-2 text-right text-xs pt-2 text-muted-foreground flex items-center justify-end gap-1">
                          <span>
                            {isAutoCalc
                              ? `${item.autoCalcPercentOfRevenue}% rev`
                              : `${fmt(weekly)}/wk`}
                          </span>
                          {item.isCustom && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(cat.key, item.key)}
                              title="Delete custom item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add item form */}
                  {isAdding ? (
                    <div className="border-2 border-dashed border-primary/40 rounded p-3 bg-primary/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">New line item in {cat.label}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => { setAddingCat(null); setForm(EMPTY_FORM); }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-12 sm:col-span-5">
                          <Input
                            placeholder="Label (e.g. CapCut Pro)"
                            value={form.label}
                            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <Input
                              type="number"
                              placeholder="0"
                              value={form.amount}
                              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                              className="pl-6 h-8 text-sm"
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="col-span-6 sm:col-span-2">
                          <Select
                            value={form.recurrence}
                            onValueChange={(v: Recurrence) => setForm(f => ({ ...f, recurrence: v }))}
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
                        <div className="col-span-12 sm:col-span-2 flex items-center gap-1.5">
                          <Checkbox
                            id={`tax-${cat.key}`}
                            checked={form.taxDeductible}
                            onCheckedChange={c => setForm(f => ({ ...f, taxDeductible: !!c }))}
                          />
                          <label htmlFor={`tax-${cat.key}`} className="text-[10px] text-muted-foreground cursor-pointer">
                            T&T deductible
                          </label>
                        </div>
                        <div className="col-span-12">
                          <Input
                            placeholder="Optional notes (vendor, account ref, etc.)"
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setAddingCat(null); setForm(EMPTY_FORM); }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddSubmit(cat.key)}
                          disabled={!form.label.trim()}
                        >
                          Add item
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-1 h-8 text-xs border-dashed"
                      onClick={() => { setAddingCat(cat.key); setForm(EMPTY_FORM); }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add line item
                    </Button>
                  )}

                  {CATEGORY_HINTS[cat.key] && (
                    <div className="text-[10px] text-muted-foreground italic pt-1 border-t border-dashed">
                      💡 {CATEGORY_HINTS[cat.key]}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
    );
  };

  return (
    <TooltipProvider>
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
            Use <strong>+ Add line item</strong> in any category to log tools, vendors, or expenses
            specific to your business.
          </span>
        </div>

        {/* Section A — Care Operations (Per Client) */}
        {careOpsCats.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-900">A. Care Operations (Per Client)</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-amber-700"><HelpCircle className="h-3.5 w-3.5" /></button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Scales per client — coordination, training, oversight. Each client absorbs their full share each week they're active.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-800 text-xs">
                {fmt(layered.careOps)}/wk subtotal
              </Badge>
            </div>
            {careOpsCats.map(cat => <React.Fragment key={cat.key}>{renderCategory(cat)}</React.Fragment>)}
          </div>
        )}

        {/* Section B — Platform & Shared Overhead (Distributed) */}
        {platformCats.length > 0 && (
          <div className="space-y-2 pt-3">
            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-900">B. Platform &amp; Shared Overhead (Distributed)</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-purple-700"><HelpCircle className="h-3.5 w-3.5" /></button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Shared across all clients — divided by active client count. Cost per client decreases as you scale.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-800 text-xs">
                {fmt(layered.platform)}/wk subtotal
              </Badge>
            </div>
            {platformCats.map(cat => <React.Fragment key={cat.key}>{renderCategory(cat)}</React.Fragment>)}
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
