
import React, { useState, useEffect } from "react";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, CalendarCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createCareShift, updateCareShift, CareShift } from "@/services/care-plan-service";
import { supabase } from "@/integrations/supabase/client";

interface ShiftCreationFormProps {
  familyId: string;
  carePlanId: string;
  existingShift?: CareShift | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Time options for the dropdown
const TIME_OPTIONS = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", 
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", 
  "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM",
  "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM", 
  "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM",
];

// Shift template options
const SHIFT_TEMPLATES = [
  { 
    id: "morning", 
    label: "Morning Shift (6 AM - 12 PM)",
    startTime: "6:00 AM",
    endTime: "12:00 PM"
  },
  { 
    id: "day", 
    label: "Day Shift (8 AM - 4 PM)",
    startTime: "8:00 AM",
    endTime: "4:00 PM"
  },
  { 
    id: "afternoon", 
    label: "Afternoon Shift (12 PM - 6 PM)",
    startTime: "12:00 PM",
    endTime: "6:00 PM"
  },
  { 
    id: "evening", 
    label: "Evening Shift (4 PM - 10 PM)",
    startTime: "4:00 PM",
    endTime: "10:00 PM"
  },
  { 
    id: "night", 
    label: "Night Shift (10 PM - 6 AM)",
    startTime: "10:00 PM",
    endTime: "6:00 AM"
  },
  { 
    id: "extended", 
    label: "Extended Day (8 AM - 8 PM)",
    startTime: "8:00 AM",
    endTime: "8:00 PM"
  },
  { 
    id: "short", 
    label: "Short Visit (2 hours)",
    startTime: "9:00 AM",
    endTime: "11:00 AM"
  },
  { 
    id: "custom", 
    label: "Custom Shift",
    startTime: "",
    endTime: ""
  },
];

// Form validation schema
const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  assignToCaregiverId: z.string().optional(),
  leaveUnassigned: z.boolean().default(true),
  shiftTemplate: z.string().optional(),
});

// Convert 12-hour time format to Date object
const parseTimeString = (timeString: string, baseDate: Date): Date => {
  const [time, period] = timeString.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return setMinutes(setHours(baseDate, hour), minute);
};

export function ShiftCreationForm({ 
  familyId, 
  carePlanId, 
  existingShift, 
  onSuccess, 
  onCancel 
}: ShiftCreationFormProps) {
  const [caregivers, setCaregivers] = useState<Array<{ id: string; name: string; avatarUrl?: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  // Set default form values
  const defaultValues = {
    title: existingShift?.title || "Care Shift",
    description: existingShift?.description || "",
    date: existingShift ? new Date(existingShift.start_time) : new Date(),
    startTime: existingShift ? format(new Date(existingShift.start_time), "h:mm a") : "9:00 AM",
    endTime: existingShift ? format(new Date(existingShift.end_time), "h:mm a") : "5:00 PM",
    location: existingShift?.location || "Patient's home",
    assignToCaregiverId: existingShift?.caregiver_id || "",
    leaveUnassigned: existingShift ? !existingShift.caregiver_id : true,
    shiftTemplate: "custom",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Load caregivers for this care plan
  useEffect(() => {
    const loadCaregivers = async () => {
      try {
        // First get care team members for this care plan
        const { data: teamMembers, error: teamError } = await supabase
          .from('care_team_members')
          .select('caregiver_id')
          .eq('care_plan_id', carePlanId)
          .eq('status', 'active');
        
        if (teamError) throw teamError;
        
        if (!teamMembers || teamMembers.length === 0) {
          return;
        }
        
        // Then get the profiles for these caregivers
        const caregiverIds = teamMembers.map(member => member.caregiver_id);
        
        const { data: caregiverProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', caregiverIds);
        
        if (profilesError) throw profilesError;
        
        const formattedCaregivers = caregiverProfiles.map(profile => ({
          id: profile.id,
          name: profile.full_name || "Unknown Caregiver",
          avatarUrl: profile.avatar_url
        }));
        
        setCaregivers(formattedCaregivers);
      } catch (error) {
        console.error("Error loading caregivers:", error);
        toast.error("Failed to load caregivers");
      }
    };
    
    loadCaregivers();
  }, [carePlanId]);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const template = SHIFT_TEMPLATES.find(t => t.id === templateId);
    if (template && template.id !== "custom") {
      form.setValue("startTime", template.startTime);
      form.setValue("endTime", template.endTime);
    }
    form.setValue("shiftTemplate", templateId);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      const baseDate = values.date;
      const startDateTime = parseTimeString(values.startTime, baseDate);
      
      // Handle overnight shifts where end time is on the next day
      let endDateTime = parseTimeString(values.endTime, baseDate);
      if (endDateTime < startDateTime) {
        endDateTime = addDays(endDateTime, 1);
      }
      
      const shiftData = {
        care_plan_id: carePlanId,
        family_id: familyId,
        caregiver_id: values.leaveUnassigned ? undefined : values.assignToCaregiverId,
        title: values.title,
        description: values.description,
        location: values.location,
        status: values.leaveUnassigned ? 'open' : 'assigned',
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      };
      
      if (existingShift) {
        // Update existing shift
        await updateCareShift(existingShift.id, shiftData);
        toast.success("Care shift updated successfully");
      } else {
        // Create new shift
        await createCareShift(shiftData);
        toast.success("Care shift created successfully");
        
        // If the shift was created as unassigned, optionally notify eligible caregivers
        if (values.leaveUnassigned) {
          // In a real implementation, you would send notifications here
          console.log("Unassigned shift created - notification would be sent to eligible caregivers");
        }
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving care shift:", error);
      toast.error("Failed to save care shift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Shift Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Title</FormLabel>
              <FormControl>
                <Input placeholder="Care Shift" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Shift Template */}
        <FormField
          control={form.control}
          name="shiftTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Template</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTemplateChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SHIFT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Patient's home" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about this shift" 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Leave Unassigned Toggle */}
        <FormField
          control={form.control}
          name="leaveUnassigned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Leave Unassigned</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this an open opportunity that caregivers can claim
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Caregiver Assignment (only shown if not leaving unassigned) */}
        {!form.watch('leaveUnassigned') && (
          <FormField
            control={form.control}
            name="assignToCaregiverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Caregiver</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select caregiver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {caregivers.length > 0 ? (
                      caregivers.map((caregiver) => (
                        <SelectItem key={caregiver.id} value={caregiver.id}>
                          {caregiver.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No caregivers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : existingShift ? 'Update Shift' : 'Create Shift'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
