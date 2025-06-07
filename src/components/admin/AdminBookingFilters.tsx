
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Filter, X, Search } from "lucide-react";
import { format } from 'date-fns';

interface BookingFilters {
  status: string;
  visitType: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  nurseAssigned: string;
  searchTerm: string;
}

interface AdminBookingFiltersProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  totalBookings: number;
  filteredCount: number;
}

export const AdminBookingFilters: React.FC<AdminBookingFiltersProps> = ({
  filters,
  onFiltersChange,
  totalBookings,
  filteredCount
}) => {
  const updateFilter = (key: keyof BookingFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: '',
      visitType: '',
      dateRange: {},
      nurseAssigned: '',
      searchTerm: ''
    });
  };

  const hasActiveFilters = filters.status || filters.visitType || filters.dateRange.from || filters.nurseAssigned || filters.searchTerm;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary">
              {filteredCount} of {totalBookings} bookings
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search family name..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={filters.status || "all"} onValueChange={(value) => updateFilter('status', value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visit Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Visit Type</label>
          <Select value={filters.visitType || "all"} onValueChange={(value) => updateFilter('visitType', value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="in_person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nurse Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nurse Assigned</label>
          <Select value={filters.nurseAssigned || "all"} onValueChange={(value) => updateFilter('nurseAssigned', value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All nurses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nurses</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from 
                    ? format(filters.dateRange.from, "PPP")
                    : "From date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to 
                    ? format(filters.dateRange.to, "PPP")
                    : "To date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};
