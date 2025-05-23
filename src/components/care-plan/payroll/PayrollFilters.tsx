
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareTeamMemberWithProfile } from '@/types/careTypes';

interface PayrollFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRangeFilter: string;
  onDateRangeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  caregiverFilter: string;
  onCaregiverChange: (value: string) => void;
  careTeamMembers: CareTeamMemberWithProfile[];
  showPayrollStatuses?: boolean;
}

export const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  searchTerm,
  onSearchChange,
  dateRangeFilter,
  onDateRangeChange,
  statusFilter,
  onStatusChange,
  caregiverFilter,
  onCaregiverChange,
  careTeamMembers = [],
  showPayrollStatuses = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
      <Input 
        placeholder="Search by name or notes" 
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full md:w-auto"
      />
      
      <Select value={dateRangeFilter} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7">Last 7 days</SelectItem>
          <SelectItem value="last30">Last 30 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {!showPayrollStatuses ? (
            <>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      <Select value={caregiverFilter} onValueChange={onCaregiverChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Select caregiver" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All caregivers</SelectItem>
          {careTeamMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.professionalDetails?.full_name || 'Unknown'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
