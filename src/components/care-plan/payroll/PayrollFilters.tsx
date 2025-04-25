
import React from 'react';
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DateRange } from 'react-day-picker';

interface PayrollFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRangeFilter: { from?: Date; to?: Date };
  onDateRangeChange: (value: DateRange | { from?: Date; to?: Date }) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  showPayrollStatuses?: boolean;
}

export const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  searchTerm,
  onSearchChange,
  dateRangeFilter,
  onDateRangeChange,
  statusFilter,
  onStatusChange,
  showPayrollStatuses = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <Input
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:w-[200px]"
      />
      
      <DateRangePicker 
        value={dateRangeFilter}
        onChange={onDateRangeChange}
        className="w-full sm:w-auto"
      />
      
      <Select
        value={statusFilter}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="sm:w-[150px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {showPayrollStatuses ? (
            <>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
