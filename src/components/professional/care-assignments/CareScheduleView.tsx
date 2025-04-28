
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarePlan } from "@/types/carePlan";
import { CareShift } from "@/types/careTypes";
import { ProfessionalScheduleCalendar } from './ProfessionalScheduleCalendar';
import { useAuth } from "@/components/providers/AuthProvider";

interface CareScheduleViewProps {
  careShifts: CareShift[];
  carePlans: CarePlan[];
  selectedPlanId: string | null;
}

export const CareScheduleView: React.FC<CareScheduleViewProps> = ({ 
  careShifts,
  carePlans,
  selectedPlanId 
}) => {
  const { user } = useAuth();
  const [filteredShifts, setFilteredShifts] = useState<CareShift[]>([]);
  const [viewFilter, setViewFilter] = useState<'all' | 'mine'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  useEffect(() => {
    let filtered = [...careShifts];
    
    // Filter by care plan if selected
    if (planFilter !== 'all') {
      filtered = filtered.filter(shift => shift.carePlanId === planFilter);
    } else if (selectedPlanId) {
      filtered = filtered.filter(shift => shift.carePlanId === selectedPlanId);
    }
    
    // Filter by assigned to current user if 'mine' is selected
    if (viewFilter === 'mine' && user) {
      filtered = filtered.filter(shift => shift.caregiverId === user.id);
    }
    
    setFilteredShifts(filtered);
  }, [careShifts, selectedPlanId, planFilter, viewFilter, user]);

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value);
  };
  
  const handleViewFilterChange = (value: string) => {
    setViewFilter(value as 'all' | 'mine');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
          <div>
            <CardTitle>Care Schedule</CardTitle>
            <CardDescription>
              View and manage your assigned care shifts
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={viewFilter} onValueChange={handleViewFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="mine">My Assignments</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={planFilter} onValueChange={handlePlanFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by care plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Care Plans</SelectItem>
                {carePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredShifts.length ? (
          <ProfessionalScheduleCalendar 
            shifts={filteredShifts}
            carePlans={carePlans}
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              No shifts found for the selected filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
