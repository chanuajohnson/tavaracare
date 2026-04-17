import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ClientEconomics } from '@/hooks/admin/useUnitEconomics';

interface Props {
  clients: ClientEconomics[];
}

function StatusBadge({ status }: { status: ClientEconomics['status'] }) {
  if (status === 'profitable') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><TrendingUp className="h-3 w-3 mr-1" />Profitable</Badge>;
  if (status === 'at-risk') return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />At Risk</Badge>;
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><TrendingDown className="h-3 w-3 mr-1" />Losing</Badge>;
}

function MarginCell({ value, percent }: { value: number; percent: number }) {
  const color = percent >= 20 ? 'text-green-700' : percent >= 10 ? 'text-yellow-700' : 'text-red-700';
  return (
    <span className={`font-semibold ${color}`}>
      ${value.toLocaleString()} ({percent}%)
    </span>
  );
}

function fmt(n: number) {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function UnitEconomicsTable({ clients }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!clients.length) {
    return <p className="text-center text-muted-foreground py-8">No active care plans found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Revenue/mo</TableHead>
            <TableHead className="text-right" title="Direct Care Costs: caregiver compensation + NIS contribution (caregiver) + reimbursable expenses (scales 1:1 with this client)">Direct Care</TableHead>
            <TableHead className="text-right" title="Care Operations: per-client coordination, training, oversight (prorated by weeks active)">Care Ops</TableHead>
            <TableHead className="text-right" title="Allocated Ops: this client's share of platform overhead (total platform cost ÷ active clients). Decreases as you scale.">Allocated Ops</TableHead>
            <TableHead className="text-right">Total Cost/mo</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map(client => {
            const isOpen = expandedIds.has(client.carePlanId);
            return (
              <React.Fragment key={client.carePlanId}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggle(client.carePlanId)}
                >
                  <TableCell className="p-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.familyName}</div>
                    <div className="text-xs text-muted-foreground">{client.carePlanTitle}</div>
                  </TableCell>
                  <TableCell>
                    {client.payrollWeeks === 0 ? (
                      <Badge variant="outline" className="text-xs text-muted-foreground">No care payments this month</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">{client.subscriptionPlan}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">{fmt(client.monthlyRevenue)}</TableCell>
                  <TableCell className="text-right text-blue-700">{fmt(client.monthlyDirectCost)}</TableCell>
                  <TableCell className="text-right text-amber-700">{fmt(client.monthlyCareOpsCost)}</TableCell>
                  <TableCell className="text-right text-purple-700">{fmt(client.monthlyAllocatedPlatformCost)}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(client.monthlyTotalCost)}</TableCell>
                  <TableCell className="text-right">
                    <MarginCell value={client.monthlyMargin} percent={client.marginPercent} />
                  </TableCell>
                  <TableCell><StatusBadge status={client.status} /></TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow>
                    <TableCell colSpan={10} className="bg-muted/30 p-4">
                      <div className="space-y-3">
                        {/* Payroll Period */}
                        {client.periodStart && client.periodEnd && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background border rounded px-3 py-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>
                              Payroll month: <span className="font-medium text-foreground">{client.periodStart} – {client.periodEnd}</span>
                              {' '}({client.payrollWeeks} week{client.payrollWeeks !== 1 ? 's' : ''})
                            </span>
                          </div>
                        )}

                        {/* Revenue Breakdown */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Revenue Breakdown</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="text-xs bg-background rounded p-2 border">
                              <span className="text-muted-foreground block">Tavara Care Coordination Fee</span>
                              <span className="font-medium text-sm">
                                {fmt(client.monthlySubscriptionRevenue)}/mo
                              </span>
                              <span className="text-muted-foreground block text-[10px]">
                                {client.subscriptionCadence === 'monthly_flat'
                                  ? `${client.subscriptionPlan} — ${fmt(client.monthlySubscriptionRevenue)} flat monthly`
                                  : `${client.subscriptionPlan} — ${fmt(client.payrollWeeks > 0 ? client.monthlySubscriptionRevenue / client.payrollWeeks : 0)}/wk × ${client.payrollWeeks} weeks`}
                              </span>
                            </div>
                            <div className="text-xs bg-background rounded p-2 border">
                              <span className="text-muted-foreground block">Caregiver Compensation Pass-through</span>
                              <span className="font-medium text-sm">{fmt(client.monthlyCaregiverFees)}/mo</span>
                              <span className="text-muted-foreground block text-[10px]">
                                Actual compensation from payroll
                              </span>
                            </div>
                            {client.monthlyServiceRevenue > 0 && (
                              <div className="text-xs bg-background rounded p-2 border">
                                <span className="text-muted-foreground block">Service Revenue</span>
                                <span className="font-medium text-sm">{fmt(client.monthlyServiceRevenue)}/mo</span>
                                <span className="text-muted-foreground block text-[10px]">
                                  {client.serviceBreakdown.length} approved service(s)
                                </span>
                              </div>
                            )}
                            <div className="text-xs bg-background rounded p-2 border border-primary/30">
                              <span className="text-muted-foreground block">Total Revenue</span>
                              <span className="font-semibold text-sm">{fmt(client.monthlyRevenue)}/mo</span>
                              <span className="text-muted-foreground block text-[10px]">
                                {fmt(client.monthlySubscriptionRevenue)} + {fmt(client.monthlyCaregiverFees)}{client.monthlyServiceRevenue > 0 ? ` + ${fmt(client.monthlyServiceRevenue)}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Service Revenue Breakdown */}
                        {client.serviceBreakdown.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Service Revenue Breakdown</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {client.serviceBreakdown.map((svc, i) => (
                                <div key={i} className="text-xs bg-background rounded p-2 border">
                                  <span className="block font-medium">{svc.label}</span>
                                  <span className="text-muted-foreground">{svc.billingType}</span>
                                  <span className="block font-semibold">{fmt(svc.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Caregiver Breakdown */}
                        <h4 className="text-sm font-semibold">Caregiver Breakdown (care payment month totals)</h4>
                        {client.caregiverBreakdowns.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Caregiver</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Gross Pay</TableHead>
                                <TableHead className="text-right">NIS Contribution (Caregiver)</TableHead>
                                <TableHead className="text-right">Employee NIS</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {client.caregiverBreakdowns.map(cg => (
                                <TableRow key={cg.caregiverId}>
                                  <TableCell>{cg.caregiverName}</TableCell>
                                  <TableCell className="text-right">{cg.totalHours}</TableCell>
                                  <TableCell className="text-right">{fmt(cg.totalPay)}</TableCell>
                                  <TableCell className="text-right">{fmt(cg.employerNis)}</TableCell>
                                  <TableCell className="text-right">{fmt(cg.employeeNis)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground">No care payment data for this month.</p>
                        )}

                        {/* 3-Layer Cost Breakdown */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">3-Layer Cost Breakdown</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="text-xs bg-background rounded p-3 border border-blue-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-blue-700">Layer 1 — Direct Care</span>
                                <span className="font-bold text-blue-700">{fmt(client.monthlyDirectCost)}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground space-y-0.5">
                                <div>Compensation: {fmt(client.monthlyCaregiverCost)}</div>
                                <div>NIS Contribution (Caregiver): {fmt(client.monthlyNisCost)}</div>
                                <div>Expenses: {fmt(client.monthlyExpenses)}</div>
                                <div className="italic pt-0.5">Scales 1:1 with this client</div>
                              </div>
                            </div>
                            <div className="text-xs bg-background rounded p-3 border border-amber-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-amber-700">Layer 2 — Care Ops</span>
                                <span className="font-bold text-amber-700">{fmt(client.monthlyCareOpsCost)}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground space-y-0.5">
                                <div>Coordination, training, oversight</div>
                                <div>Prorated by {client.payrollWeeks} active week{client.payrollWeeks !== 1 ? 's' : ''}</div>
                                <div className="italic pt-0.5">Per-client, controlled spend</div>
                              </div>
                            </div>
                            <div className="text-xs bg-background rounded p-3 border border-purple-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-purple-700">Layer 3 — Allocated Platform</span>
                                <span className="font-bold text-purple-700">{fmt(client.monthlyAllocatedPlatformCost)}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground space-y-0.5">
                                <div>Founder, software, marketing, admin</div>
                                <div>This client's share of shared overhead</div>
                                <div className="italic pt-0.5">Decreases as you add more clients</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Marginal vs Final Profit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="bg-background rounded p-3 border-2 border-dashed">
                            <div className="text-xs text-muted-foreground mb-1">
                              👉 Marginal Profit <span className="italic">(before allocation)</span>
                            </div>
                            <div className={`text-lg font-bold ${client.monthlyDirectMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {fmt(client.monthlyDirectMargin)} <span className="text-sm">({client.monthlyDirectMarginPercent}%)</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Revenue − Direct − Care Ops · True per-client contribution
                            </div>
                          </div>
                          <div className="bg-background rounded p-3 border-2 border-primary/40">
                            <div className="text-xs text-muted-foreground mb-1">
                              👉 Final Profit <span className="italic">(after platform allocation)</span>
                            </div>
                            <div className={`text-lg font-bold ${client.monthlyMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {fmt(client.monthlyMargin)} <span className="text-sm">({client.marginPercent}%)</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              After absorbing share of platform overhead
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
