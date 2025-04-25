
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
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  startOfYear,
  endOfYear
} from 'date-fns';

interface PayrollFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRangeFilter: { from?: Date; to?: Date };
  onDateRangeChange: (value: DateRange | { from?: Date; to?: Date }) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  showPayrollStatuses?: boolean;
  caregiverFilter?: string;
  onCaregiverChange?: (value: string) => void;
  caregivers?: Array<{ id: string; name: string }>;
  onQuickDateRangeSelect?: (range: { from?: Date; to?: Date }) => void;
  className?: string; // Added className prop to the interface
}

export const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  searchTerm,
  onSearchChange,
  dateRangeFilter,
  onDateRangeChange,
  statusFilter,
  onStatusChange,
  showPayrollStatuses = false,
  caregiverFilter,
  onCaregiverChange,
  caregivers = [],
  onQuickDateRangeSelect,
  className, // Added className prop to destructuring
}) => {
  const handleQuickDateSelect = (period: string) => {
    const now = new Date();
    let range: { from?: Date; to?: Date } = {};
    
    switch (period) {
      case 'all':
        range = {};
        break;
      case 'this-month':
        range = {
          from: startOfMonth(now),
          to: endOfMonth(now)
        };
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        range = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
        break;
      case 'this-year':
        range = {
          from: startOfYear(now),
          to: endOfYear(now)
        };
        break;
      default:
        range = {};
    }
    
    if (onQuickDateRangeSelect) {
      onQuickDateRangeSelect(range);
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 w-full ${className || ''}`}>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Input
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sm:w-[200px]"
        />
        
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <DateRangePicker 
            value={dateRangeFilter}
            onChange={onDateRangeChange}
            className="w-full sm:w-auto"
          />
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleQuickDateSelect('all')} 
              className={`text-xs px-2 py-1 rounded-md ${!dateRangeFilter.from ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              All Time
            </button>
            <button 
              onClick={() => handleQuickDateSelect('this-month')} 
              className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80"
            >
              This Month
            </button>
            <button 
              onClick={() => handleQuickDateSelect('last-month')} 
              className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80"
            >
              Last Month
            </button>
            <button 
              onClick={() => handleQuickDateSelect('this-year')} 
              className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80"
            >
              This Year
            </button>
          </div>
        </div>
        
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
        
        {caregivers && caregivers.length > 0 && onCaregiverChange && (
          <Select
            value={caregiverFilter}
            onValueChange={onCaregiverChange}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All Caregivers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Caregivers</SelectItem>
              {caregivers.map(caregiver => (
                <SelectItem key={caregiver.id} value={caregiver.id}>
                  {caregiver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
