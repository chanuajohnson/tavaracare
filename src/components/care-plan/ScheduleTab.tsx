import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarRange, Calendar, ChevronDown, Plus, Users, AlertTriangle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ShiftCalendar } from "./ShiftCalendar";
import { CareShift, CareShiftInput, CareTeamMemberWithProfile } from "@/types/careTypes";
import { createCareShift, updateCareShift } from "@/services/care-plans";
import { WorkLogForm } from './WorkLogForm';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ScheduleTabProps {
  carePlanId: string;
  familyId: string;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  onShiftUpdated: () => void;
  onDeleteShift: (shiftId: string) => void;
}

interface ShiftTypeOption {
  id: string;
  label: string;
  description: string;
  timeRange: { start: string; end: string };
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  carePlanId,
  familyId,
  careShifts,
  careTeamMembers,
  onShiftUpdated,
  onDeleteShift
}) => {
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [newShift, setNewShift] = useState({
    caregiverId: "",
    title: "",
    selectedShiftType: "",
    description: "",
    day: "",
    timeSlot: "",
    recurring: "no",
    location: "",
    isEmergencyCoverage: false,
    emergencyReason: ""
  });
  const [editingShift, setEditingShift] = useState<CareShift | null>(null);
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [workLogFormOpen, setWorkLogFormOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<CareShift | null>(null);

  const SHIFT_TITLE_OPTIONS: ShiftTypeOption[] = [
    { id: "weekday_standard", label: "Monday - Friday, 8 AM - 4 PM", description: "Standard daytime coverage during business hours", timeRange: { start: "08:00", end: "16:00" } },
    { id: "weekday_standard_extended", label: "Monday - Friday, 8 AM - 6 PM", description: "Extended daytime coverage with longer hours", timeRange: { start: "08:00", end: "18:00" } },
    { id: "weekday_extended", label: "Monday - Friday, 6 AM - 6 PM", description: "Extended daytime coverage for more comprehensive care", timeRange: { start: "06:00", end: "18:00" } },
    { id: "weekday_night", label: "Monday - Friday, 6 PM - 8 AM", description: "Extended nighttime coverage to relieve standard daytime coverage", timeRange: { start: "18:00", end: "08:00" } },
    { id: "saturday_sunday", label: "Saturday - Sunday, 6 AM - 6 PM", description: "Daytime weekend coverage with a dedicated caregiver", timeRange: { start: "06:00", end: "18:00" } },
    { id: "saturday_sunday_8am_6pm", label: "Saturday - Sunday, 8 AM - 6 PM", description: "Standard weekend coverage for family assistance", timeRange: { start: "08:00", end: "18:00" } },
    { id: "weekday_evening_4pm_6am", label: "Weekday Evening Shift (4 PM - 6 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "16:00", end: "06:00" } },
    { id: "weekday_evening_4pm_8am", label: "Weekday Evening Shift (4 PM - 8 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "16:00", end: "08:00" } },
    { id: "weekday_evening_6pm_6am", label: "Weekday Evening Shift (6 PM - 6 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "18:00", end: "06:00" } },
    { id: "weekday_evening_6pm_8am", label: "Weekday Evening Shift (6 PM - 8 AM)", description: "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage", timeRange: { start: "18:00", end: "08:00" } }
  ];

  const sendEmergencyWhatsAppBroadcast = async (shift: CareShift, reason: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-nudge-whatsapp', {
        body: {
          care_plan_id: carePlanId,
          message_type: 'emergency_shift_coverage',
          shift_details: {
            id: shift.id,
            title: shift.title,
            start_time: shift.startTime,
            end_time: shift.endTime,
            location: shift.location,
            reason: reason
          }
        }
      });

      if (error) {
        console.error('Error sending emergency broadcast:', error);
        toast.error('Failed to send emergency broadcast to team');
      } else {
        toast.success('Emergency shift broadcast sent to care team!');
      }
    } catch (error) {
      console.error('Error sending emergency broadcast:', error);
      toast.error('Failed to send emergency broadcast');
    }
  };

  const handleCreateShift = async () => {
    try {
      const baseDayDate = selectedDay || (dateRange?.from ? new Date(dateRange.from) : new Date());
      
      const selectedShiftType = SHIFT_TITLE_OPTIONS.find(option => option.id === newShift.selectedShiftType);
      
      if (!selectedShiftType) {
        return;
      }

      const datesToCreateShifts = [];
      
      if (isRangeSelection && dateRange?.from && dateRange.to) {
        let currentDate = new Date(dateRange.from);
        const endDate = new Date(dateRange.to);
        
        while (currentDate <= endDate) {
          datesToCreateShifts.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        datesToCreateShifts.push(baseDayDate);
      }
      
      for (const shiftDate of datesToCreateShifts) {
        const shiftTitle = selectedShiftType.label;
        
        const [startHour, startMinute] = selectedShiftType.timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = selectedShiftType.timeRange.end.split(':').map(Number);
        
        const startTime = new Date(shiftDate);
        startTime.setHours(startHour, startMinute, 0);
        
        const endTime = new Date(shiftDate);
        if (endHour < startHour) {
          endTime.setDate(endTime.getDate() + 1);
        }
        endTime.setHours(endHour, endMinute, 0);

        const shiftData: CareShiftInput = {
          carePlanId,
          familyId,
          caregiverId: newShift.caregiverId !== "unassigned" ? newShift.caregiverId : undefined,
          title: shiftTitle,
          description: selectedShiftType.description,
          location: "Patient's home",
          status: newShift.isEmergencyCoverage ? "open" : "open",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };

        let createdShift;
        if (editingShift && !isRangeSelection) {
          createdShift = await updateCareShift(editingShift.id, shiftData);
        } else {
          createdShift = await createCareShift(shiftData);
        }

        // If this is emergency coverage and we created the shift successfully, send WhatsApp broadcast
        if (newShift.isEmergencyCoverage && createdShift && newShift.emergencyReason.trim()) {
          await sendEmergencyWhatsAppBroadcast(createdShift, newShift.emergencyReason);
        }
      }

      setShiftDialogOpen(false);
      resetShiftForm();
      onShiftUpdated();
    } catch (error) {
      console.error("Error creating/updating care shift:", error);
    }
  };

  const resetShiftForm = () => {
    setNewShift({
      caregiverId: "",
      title: "",
      selectedShiftType: "",
      description: "",
      day: "",
      timeSlot: "",
      recurring: "no",
      location: "",
      isEmergencyCoverage: false,
      emergencyReason: ""
    });
    setEditingShift(null);
    setDateRange({ from: undefined, to: undefined });
    setIsRangeSelection(false);
  };

  const handleEditShift = (shift: CareShift) => {
    const shiftDate = new Date(shift.startTime);
    
    const matchingShiftType = SHIFT_TITLE_OPTIONS.find(option => 
      option.label === shift.title
    ) || SHIFT_TITLE_OPTIONS[0];
    
    setSelectedDay(shiftDate);
    setNewShift({
      caregiverId: shift.caregiverId || "",
      title: shift.title,
      selectedShiftType: matchingShiftType.id,
      description: shift.description || "",
      day: format(shiftDate, "yyyy-MM-dd"),
      timeSlot: "",
      recurring: "no",
      location: shift.location || "",
      isEmergencyCoverage: false,
      emergencyReason: ""
    });
    setEditingShift(shift);
    setIsRangeSelection(false);
    setDateRange({ from: undefined, to: undefined });
    setShiftDialogOpen(true);
  };

  const openNewShiftDialog = (day: Date) => {
    setSelectedDay(day);
    setNewShift({
      ...newShift,
      day: format(day, "yyyy-MM-dd"),
    });
    setEditingShift(null);
    setIsRangeSelection(false);
    setDateRange({ from: undefined, to: undefined });
    setShiftDialogOpen(true);
  };

  const handleLogHours = (shift: CareShift) => {
    setSelectedShift(shift);
    setWorkLogFormOpen(true);
  };

  const handleWorkLogSuccess = () => {
    setWorkLogFormOpen(false);
    setSelectedShift(null);
    onShiftUpdated();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Care Schedule</CardTitle>
            <CardDescription>
              Manage care shifts based on the care plan coverage
            </CardDescription>
          </div>
          {careTeamMembers.length > 0 && (
            <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
              <Button onClick={() => {
                setSelectedDay(new Date());
                setShiftDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingShift ? 'Edit Shift' : 'Assign shift and team'}</DialogTitle>
                  <DialogDescription>
                    {editingShift 
                      ? 'Update this care shift details and assignment' 
                      : 'Add a new care shift to the schedule'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Shift Title</Label>
                    <Select 
                      value={newShift.selectedShiftType} 
                      onValueChange={(value) => setNewShift({...newShift, selectedShiftType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFT_TITLE_OPTIONS.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Emergency Coverage Option */}
                  {!editingShift && (
                    <div className="space-y-3 p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="emergency-coverage"
                          checked={newShift.isEmergencyCoverage}
                          onCheckedChange={(checked) => setNewShift({
                            ...newShift, 
                            isEmergencyCoverage: !!checked,
                            emergencyReason: checked ? newShift.emergencyReason : ""
                          })}
                        />
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <Label htmlFor="emergency-coverage" className="font-medium text-orange-800">
                            Emergency Coverage / Open Shift
                          </Label>
                        </div>
                      </div>
                      {newShift.isEmergencyCoverage && (
                        <div className="space-y-2">
                          <Label htmlFor="emergency-reason" className="text-sm text-orange-700">
                            Reason for emergency coverage (will be sent to team)
                          </Label>
                          <Textarea
                            id="emergency-reason"
                            placeholder="e.g., Assigned nurse called in sick, family emergency, etc."
                            value={newShift.emergencyReason}
                            onChange={(e) => setNewShift({...newShift, emergencyReason: e.target.value})}
                            className="border-orange-300 focus:border-orange-500"
                            rows={3}
                          />
                          <p className="text-xs text-orange-600">
                            📱 This will send an urgent WhatsApp message to all care team members
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Date Selection</Label>
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        variant={isRangeSelection ? "default" : "outline"} 
                        className="w-1/2"
                        onClick={() => setIsRangeSelection(true)}
                      >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Date Range
                      </Button>
                      <Button 
                        type="button" 
                        variant={!isRangeSelection ? "default" : "outline"} 
                        className="w-1/2"
                        onClick={() => setIsRangeSelection(false)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Single Date
                      </Button>
                    </div>
                  </div>

                  {!isRangeSelection ? (
                    <div className="space-y-2">
                      <Label htmlFor="day">Day</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {selectedDay ? (
                              format(selectedDay, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDay || undefined}
                            onSelect={(date) => {
                              setSelectedDay(date);
                              if (date) {
                                setNewShift({
                                  ...newShift,
                                  day: format(date, "yyyy-MM-dd"),
                                });
                              }
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            <CalendarRange className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                                </>
                              ) : (
                                format(dateRange.from, "PPP")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="caregiverId">Assign To (Optional)</Label>
                    <Select 
                      value={newShift.caregiverId} 
                      onValueChange={(value) => setNewShift({...newShift, caregiverId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {careTeamMembers.map((member) => (
                          <SelectItem key={member.caregiverId} value={member.caregiverId}>
                            {member.professionalDetails?.full_name || "Unknown Professional"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleCreateShift}
                    disabled={
                      !newShift.selectedShiftType || 
                      (isRangeSelection && (!dateRange?.from || !dateRange.to)) ||
                      (!isRangeSelection && !selectedDay) ||
                      (newShift.isEmergencyCoverage && !newShift.emergencyReason.trim())
                    }
                    className={newShift.isEmergencyCoverage ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    {newShift.isEmergencyCoverage ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Send Emergency Broadcast
                      </>
                    ) : (
                      isRangeSelection 
                        ? 'Create Shifts' 
                        : (editingShift ? 'Update Shift' : 'Create Shift')
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {careTeamMembers.length > 0 ? (
          <>
            <ShiftCalendar
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              careShifts={careShifts}
              careTeamMembers={careTeamMembers}
              onEditShift={handleEditShift}
              onDeleteShift={onDeleteShift}
              onAddShift={openNewShiftDialog}
              onLogHours={handleLogHours}
            />

            <Dialog open={workLogFormOpen} onOpenChange={setWorkLogFormOpen}>
              <DialogContent className="sm:max-w-xl">
                {selectedShift && (
                  <WorkLogForm
                    carePlanId={carePlanId}
                    shift={selectedShift}
                    onSuccess={handleWorkLogSuccess}
                    onCancel={() => setWorkLogFormOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium mb-1">Add team members first</p>
            <p className="text-sm text-muted-foreground mb-4">
              Before scheduling shifts, you need to add care professionals to your team.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
