
import { useState, useCallback, useMemo } from 'react';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';

export type DateRangeFilter = 'last7' | 'last30' | 'thisMonth' | 'all';

export const usePayrollFilters = <T extends { created_at?: string | null }>(
  items: T[],
  filterByDate: (item: T, startDate: Date) => boolean
) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('last30');

  // Wrapper function to handle string input and convert to the proper type
  const handleDateRangeChange = (value: string) => {
    setDateRangeFilter(value as DateRangeFilter);
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
    const today = new Date();
    let startDate: Date;
    
    switch(dateRangeFilter) {
      case 'last7':
        startDate = subDays(today, 7);
        filtered = filtered.filter(item => filterByDate(item, startDate));
        break;
      case 'last30':
        startDate = subDays(today, 30);
        filtered = filtered.filter(item => filterByDate(item, startDate));
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        const endDate = endOfMonth(today);
        filtered = filtered.filter(item => {
          if (!item.created_at) return false;
          const itemDate = new Date(item.created_at);
          return itemDate >= startDate && itemDate <= endDate;
        });
        break;
      default:
        // "all" - no filtering needed
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
