
import { useState, useCallback, useMemo } from 'react';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

export type DateRangeFilter = { from?: Date; to?: Date };

export const usePayrollFilters = <T extends { created_at?: string | null }>(
  items: T[],
  filterByDate: (item: T, startDate: Date) => boolean
) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>({});

  // Set date range filter
  const handleDateRangeChange = (value: DateRange | DateRangeFilter) => {
    setDateRangeFilter(value);
  };

  // Wrapper function to ensure type safety
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const filterItems = useCallback((items: T[]) => {
    let filtered = [...items];
    
    // Apply status filter if needed
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        'status' in item && (item as any).status === statusFilter ||
        'payment_status' in item && (item as any).payment_status === statusFilter
      );
    }
    
    // Apply date range filter
    if (dateRangeFilter.from) {
      const startDate = dateRangeFilter.from;
      filtered = filtered.filter(item => filterByDate(item, startDate));
    }
    
    // Apply end date filter if specified
    if (dateRangeFilter.to) {
      const endDate = new Date(dateRangeFilter.to);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(item => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate <= endDate;
      });
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        if ('caregiver_name' in item) {
          return (item as any).caregiver_name?.toLowerCase().includes(term);
        }
        if ('notes' in item) {
          return (item as any).notes?.toLowerCase().includes(term);
        }
        return false;
      });
    }
    
    return filtered;
  }, [searchTerm, statusFilter, dateRangeFilter]);

  const filters = useMemo(() => ({
    searchTerm,
    statusFilter,
    dateRangeFilter
  }), [searchTerm, statusFilter, dateRangeFilter]);

  const setFilters = {
    setSearchTerm,
    setStatusFilter: handleStatusChange,
    setDateRangeFilter: handleDateRangeChange
  };

  return {
    filters,
    setFilters,
    filterItems
  };
};
