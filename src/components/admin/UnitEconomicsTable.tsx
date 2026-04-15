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
            <TableHead className="text-right">Sub/mo</TableHead>
            <TableHead className="text-right">CG Fees/mo</TableHead>
            <TableHead className="text-right">Svc Rev/mo</TableHead>
            <TableHead className="text-right">Revenue/mo</TableHead>
            <TableHead className="text-right">Wages/mo</TableHead>
            <TableHead className="text-right">Employer NIS</TableHead>
            <TableHead className="text-right">Employee NIS</TableHead>
            <TableHead className="text-right">Ops/mo</TableHead>
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
                    <Badge variant="outline" className="text-xs">{client.subscriptionPlan}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(client.monthlySubscriptionRevenue)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(client.monthlyCaregiverFees)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(client.monthlyServiceRevenue)}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(client.monthlyRevenue)}</TableCell>
                  <TableCell className="text-right">{fmt(client.monthlyCaregiverCost)}</TableCell>
                  <TableCell className="text-right">{fmt(client.monthlyNisCost)}</TableCell>
                  <TableCell className="text-right">{fmt(client.monthlyEmployeeNis)}</TableCell>
                  <TableCell className="text-right">{fmt(client.monthlyOperatingCost)}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(client.monthlyTotalCost)}</TableCell>
                  <TableCell className="text-right">
                    <MarginCell value={client.monthlyMargin} percent={client.marginPercent} />
                  </TableCell>
                  <TableCell><StatusBadge status={client.status} /></TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow>
                    <TableCell colSpan={14} className="bg-muted/30 p-4">
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
                                {client.subscriptionPlan} — {fmt(client.weeklyOperatingCost > 0 ? client.monthlySubscriptionRevenue / client.payrollWeeks : 0)}/wk × {client.payrollWeeks} weeks
                              </span>
                            </div>
                            <div className="text-xs bg-background rounded p-2 border">
                              <span className="text-muted-foreground block">Caregiver Wages Pass-through</span>
                              <span className="font-medium text-sm">{fmt(client.monthlyCaregiverFees)}/mo</span>
                              <span className="text-muted-foreground block text-[10px]">
                                Actual wages from payroll
                              </span>
                            </div>
                            <div className="text-xs bg-background rounded p-2 border border-primary/30">
                              <span className="text-muted-foreground block">Total Revenue</span>
                              <span className="font-semibold text-sm">{fmt(client.monthlyRevenue)}/mo</span>
                              <span className="text-muted-foreground block text-[10px]">
                                {fmt(client.monthlySubscriptionRevenue)} + {fmt(client.monthlyCaregiverFees)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Caregiver Breakdown */}
                        <h4 className="text-sm font-semibold">Caregiver Breakdown (payroll month totals)</h4>
                        {client.caregiverBreakdowns.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Caregiver</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Gross Pay</TableHead>
                                <TableHead className="text-right">Employer NIS</TableHead>
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
                          <p className="text-sm text-muted-foreground">No payroll data for this month.</p>
                        )}

                        {/* Cost Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">Employer NIS:</span>
                            <span className="ml-1 font-medium">{fmt(client.monthlyNisCost)}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Employee NIS:</span>
                            <span className="ml-1 font-medium">{fmt(client.monthlyEmployeeNis)}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Expenses:</span>
                            <span className="ml-1 font-medium">{fmt(client.monthlyExpenses)}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Operating ({client.payrollWeeks} wks × {fmt(client.weeklyOperatingCost)}):</span>
                            <span className="ml-1 font-medium">{fmt(client.monthlyOperatingCost)}</span>
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
