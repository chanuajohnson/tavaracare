
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PayRateSelector } from "../PayRateSelector";
import { PayrollStatusBadge } from "../PayrollStatusBadge";
import { WorkLogExpenses } from "../WorkLogExpenses";
import { PayTotalDisplay } from "./PayTotalDisplay";
import { WorkLogActions } from "./WorkLogActions";
import type { WorkLog } from "@/services/care-plans/types/workLogTypes";

interface WorkLogTableRowProps {
  workLog: WorkLog;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onGenerateReceipt: (workLog: WorkLog) => void;
  onGenerateRangeReceipt?: (workLog: WorkLog, mode: 'week' | 'month' | 'custom') => void;
  onDelete?: (id: string) => Promise<boolean>;
  isProfessionalView?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const WorkLogTableRow = ({
  workLog,
  onApprove,
  onReject,
  onGenerateReceipt,
  onGenerateRangeReceipt,
  onDelete,
  isProfessionalView = false,
  isSelected = false,
  onToggleSelect
}: WorkLogTableRowProps) => {
  const startTime = new Date(workLog.start_time);
  const endTime = new Date(workLog.end_time);
  const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const totalExpenses = workLog.expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  const isPending = workLog.status === 'pending';

  return (
    <TableRow key={workLog.id}>
      {!isProfessionalView && (
        <TableCell className="w-10">
          {isPending ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(workLog.id)}
              aria-label={`Select work log for ${workLog.caregiver_name}`}
            />
          ) : (
            <span />
          )}
        </TableCell>
      )}
      <TableCell className="font-medium">
        {workLog.caregiver_name || 'Unknown'}
      </TableCell>
      <TableCell>
        {format(startTime, 'MMM d, yyyy')}
      </TableCell>
      <TableCell>
        {hoursDiff.toFixed(1)}h ({format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')})
      </TableCell>
      <TableCell>
        <PayRateSelector 
          workLogId={workLog.id} 
          careTeamMemberId={workLog.care_team_member_id}
          status={workLog.status}
          baseRate={workLog.base_rate}
          rateMultiplier={workLog.rate_multiplier}
        />
      </TableCell>
      <TableCell>
        <PayTotalDisplay 
          workLogId={workLog.id} 
          hours={hoursDiff} 
          expenses={totalExpenses}
          careTeamMemberId={workLog.care_team_member_id}
          baseRate={workLog.base_rate}
          rateMultiplier={workLog.rate_multiplier}
        />
      </TableCell>
      <TableCell>
        {workLog.expenses && workLog.expenses.length > 0 ? (
          <WorkLogExpenses expenses={workLog.expenses} />
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </TableCell>
      <TableCell>
        <PayrollStatusBadge status={workLog.status} />
      </TableCell>
      <TableCell className="text-right">
        <WorkLogActions
          workLog={workLog}
          onApprove={onApprove}
          onReject={onReject}
          onGenerateReceipt={onGenerateReceipt}
          onGenerateRangeReceipt={onGenerateRangeReceipt}
          onDelete={onDelete}
          isProfessionalView={isProfessionalView}
        />
      </TableCell>
    </TableRow>
  );
};
