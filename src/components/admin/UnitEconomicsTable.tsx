import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
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
            <TableHead className="text-right">Sub/wk</TableHead>
            <TableHead className="text-right">CG Fees/wk</TableHead>
            <TableHead className="text-right">Revenue/wk</TableHead>
            <TableHead className="text-right">Wages/wk</TableHead>
            <TableHead className="text-right">NIS/wk</TableHead>
            <TableHead className="text-right">Ops/wk</TableHead>
            <TableHead className="text-right">Total Cost/wk</TableHead>
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
                  <TableCell className="text-right text-muted-foreground">{fmt(client.subscriptionRevenue)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(client.weeklyCaregiverCost)}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(client.weeklyRevenue)}</TableCell>
                  <TableCell className="text-right">{fmt(client.weeklyCaregiverCost)}</TableCell>
                  <TableCell className="text-right">{fmt(client.weeklyNisCost)}</TableCell>
                  <TableCell className="text-right">{fmt(client.weeklyOperatingCost)}</TableCell>
                  <TableCell className="text-right font-medium">{fmt(client.weeklyTotalCost)}</TableCell>
                  <TableCell className="text-right">
                    <MarginCell value={client.weeklyMargin} percent={client.marginPercent} />
                  </TableCell>
                  <TableCell><StatusBadge status={client.status} /></TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow>
                    <TableCell colSpan={10} className="bg-muted/30 p-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Caregiver Breakdown (weekly avg)</h4>
                        {client.caregiverBreakdowns.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Caregiver</TableHead>
                                <TableHead className="text-right">Hours/wk</TableHead>
                                <TableHead className="text-right">Pay/wk</TableHead>
                                <TableHead className="text-right">Employer NIS/wk</TableHead>
                                <TableHead className="text-right">Employee NIS/wk</TableHead>
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
                          <p className="text-sm text-muted-foreground">No payroll data for this period.</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                          <div className="text-xs">
                            <span className="text-muted-foreground">Expenses/wk:</span>
                            <span className="ml-1 font-medium">{fmt(client.weeklyExpenses)}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Operating/wk:</span>
                            <span className="ml-1 font-medium">{fmt(client.weeklyOperatingCost)}</span>
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
