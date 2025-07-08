
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Table, Users } from "lucide-react";
import { format } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { getCaregiverName, formatTime, formatDate } from '../utils/caregiverUtils';

interface ReportPreviewProps {
  startDate: string;
  endDate: string;
  filteredShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  viewType: 'calendar' | 'table';
  reportType: 'summary' | 'detailed';
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  startDate,
  endDate,
  filteredShifts,
  careTeamMembers,
  viewType,
  reportType,
}) => {
  const uniqueCaregivers = [...new Set(filteredShifts.map(s => s.caregiverId).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Report Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{filteredShifts.length}</div>
            <div className="text-sm text-blue-700">Total Shifts</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{uniqueCaregivers.length}</div>
            <div className="text-sm text-green-700">Caregivers</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {viewType === 'calendar' ? <Calendar className="h-6 w-6 mx-auto" /> : <Table className="h-6 w-6 mx-auto" />}
            </div>
            <div className="text-sm text-purple-700 capitalize">{viewType} View</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 capitalize">{reportType}</div>
            <div className="text-sm text-orange-700">Report Type</div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Period: {formatDate(startDate)} - {formatDate(endDate)}</span>
        </div>

        {/* Sample Shifts Preview */}
        {filteredShifts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Sample Shifts:</h4>
            <div className="space-y-1">
              {filteredShifts.slice(0, 3).map((shift, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatDate(shift.startTime)}</Badge>
                    <span>{shift.title || 'Untitled Shift'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </span>
                    <Badge variant="secondary">
                      {getCaregiverName(shift.caregiverId, careTeamMembers)}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredShifts.length > 3 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  ... and {filteredShifts.length - 3} more shifts
                </div>
              )}
            </div>
          </div>
        )}

        {filteredShifts.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No shifts found in the selected date range</p>
            <p className="text-sm">Adjust your date filters to see shifts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
