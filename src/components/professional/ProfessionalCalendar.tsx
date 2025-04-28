
import React, { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Clock, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CareShift } from "@/types/careTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfessionalCalendarProps {
  shifts: CareShift[];
  loading?: boolean;
  carePlans?: any[];
}

export function ProfessionalCalendar({ shifts, loading = false, carePlans = [] }: ProfessionalCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [carePlanFilter, setCarePlanFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("assigned");
  
  // Get unique care plan IDs from shifts
  const uniqueCarePlans = useMemo(() => {
    const planIds = new Set<string>();
    shifts.forEach(shift => {
      if (shift.carePlanId) {
        planIds.add(shift.carePlanId);
      }
    });
    return Array.from(planIds);
  }, [shifts]);
  
  // Filter shifts based on selected filters
  const filteredShifts = useMemo(() => {
    if (!shifts.length) return [];
    
    return shifts.filter(shift => {
      // Filter by care plan if selected
      if (carePlanFilter !== "all" && shift.carePlanId !== carePlanFilter) {
        return false;
      }
      
      // Filter by view mode (assigned vs. open)
      if (viewMode === "assigned" && !shift.caregiverId) {
        return false;
      } else if (viewMode === "open" && shift.caregiverId) {
        return false;
      }
      
      return true;
    });
  }, [shifts, carePlanFilter, viewMode]);
  
  // Filter shifts for the selected date
  const getShiftsForDate = (date?: Date) => {
    if (!date || !filteredShifts.length) return [];
    
    const dateString = date.toISOString().split('T')[0];
    
    return filteredShifts.filter(shift => {
      const shiftStartDate = new Date(shift.startTime).toISOString().split('T')[0];
      return shiftStartDate === dateString;
    });
  };
  
  const selectedDateShifts = getShiftsForDate(date);
  
  // Format time from ISO string
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Get days with shifts for highlighting in calendar
  const getDaysWithShifts = () => {
    if (!filteredShifts.length) return {};
    
    const daysWithShifts = filteredShifts.reduce((acc: Record<string, { shift: CareShift }>, shift) => {
      const date = new Date(shift.startTime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { shift };
      }
      return acc;
    }, {});
    
    return daysWithShifts;
  };

  // Get care plan title by ID
  const getCarePlanTitle = (carePlanId?: string) => {
    if (!carePlanId) return "Unknown Plan";
    
    const carePlan = carePlans.find(plan => 
      plan.care_plans?.id === carePlanId || plan.care_plan_id === carePlanId
    );
    
    return carePlan?.care_plans?.title || "Unknown Plan";
  };
  
  // Get care plan color by ID (for visual differentiation)
  const getCarePlanColor = (carePlanId?: string) => {
    if (!carePlanId) return "bg-gray-100";
    
    // Create a simple hash from the ID to map to colors
    const colorOptions = [
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-amber-50 border-amber-200",
      "bg-purple-50 border-purple-200",
      "bg-pink-50 border-pink-200",
      "bg-cyan-50 border-cyan-200"
    ];
    
    const hash = carePlanId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colorOptions[hash % colorOptions.length];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Upcoming Care Shifts
          </CardTitle>
          <Collapsible open={isCalendarExpanded} onOpenChange={setIsCalendarExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isCalendarExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        <CardDescription>
          View and manage your upcoming care shifts
        </CardDescription>
      </CardHeader>
      
      <Collapsible open={isCalendarExpanded}>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                <ToggleGroupItem value="assigned" aria-label="View assigned shifts">
                  Assigned
                </ToggleGroupItem>
                <ToggleGroupItem value="open" aria-label="View open shifts">
                  Open
                </ToggleGroupItem>
                <ToggleGroupItem value="all" aria-label="View all shifts">
                  All
                </ToggleGroupItem>
              </ToggleGroup>
              
              {uniqueCarePlans.length > 1 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={carePlanFilter} onValueChange={setCarePlanFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Care Plans</SelectItem>
                      {carePlans.map(plan => (
                        <SelectItem 
                          key={plan.care_plans?.id} 
                          value={plan.care_plans?.id}
                        >
                          {plan.care_plans?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  booked: Object.keys(getDaysWithShifts()).map(date => new Date(date)),
                }}
                modifiersStyles={{
                  booked: { 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderRadius: '0',
                    color: 'var(--primary)'
                  }
                }}
                disabled={{ before: new Date() }}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">
                {date ? (
                  <>Shifts for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</>
                ) : (
                  <>Select a date</>
                )}
              </h3>
              
              {loading ? (
                <div className="py-4 text-center">
                  <div className="animate-pulse h-16 bg-gray-100 rounded-md"></div>
                </div>
              ) : selectedDateShifts.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateShifts.map((shift) => (
                    <div 
                      key={shift.id} 
                      className={`flex items-start gap-3 p-3 rounded-md border ${getCarePlanColor(shift.carePlanId)}`}
                    >
                      <div className="rounded-full bg-primary p-1.5 text-white self-center">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{shift.title}</h4>
                          <Badge variant="outline" className="bg-white">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </Badge>
                        </div>
                        {shift.description && (
                          <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="text-xs">
                                  {getCarePlanTitle(shift.carePlanId)}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Care Plan</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {shift.location && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs bg-white">
                                    {shift.location}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Location</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No shifts scheduled for this date</p>
                </div>
              )}
              
              {/* Legend for care plans when multiple are displayed */}
              {carePlanFilter === "all" && uniqueCarePlans.length > 1 && selectedDateShifts.length > 0 && (
                <div className="mt-4 pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Care Plans</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCarePlans.map((planId) => (
                      <Badge 
                        key={planId} 
                        variant="outline" 
                        className={`${getCarePlanColor(planId)} border`}
                      >
                        {getCarePlanTitle(planId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
