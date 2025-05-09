
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateTimeOptions } from "@/services/care-plans/shiftGenerationService";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ShiftPreferencesSectionProps {
  form: any;
}

const days = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

// Standard care coverage options that match the care plan creation page exactly
const weekdayCoverageOptions = [
  { value: "8am-4pm", label: "Option 1: Monday - Friday, 8 AM - 4 PM", description: "Standard daytime coverage during business hours." },
  { value: "8am-6pm", label: "Option 2: Monday - Friday, 8 AM - 6 PM", description: "Extended daytime coverage with later end time." },
  { value: "6am-6pm", label: "Option 3: Monday - Friday, 6 AM - 6 PM", description: "Extended daytime coverage for more comprehensive care." },
  { value: "6pm-8am", label: "Option 4: Monday - Friday, 6 PM - 8 AM", description: "Extended nighttime coverage to relieve standard daytime coverage." },
  { value: "none", label: "No Weekday Coverage", description: "Skip weekday coverage and use on-demand or other shifts." }
];

const ShiftPreferencesSection: React.FC<ShiftPreferencesSectionProps> = ({ form }) => {
  const timeOptions = generateTimeOptions();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Schedule Preferences</CardTitle>
        <CardDescription>Tell us when you need care assistance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Plan Type</h3>
          <p className="text-sm text-muted-foreground">Choose how you want to schedule care</p>
          
          {/* This would be implemented as a radio group in actual care plan creation, 
              but we'll capture data through individual preferences in this form */}
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              Based on your schedule preferences below, we'll recommend the most appropriate plan type
              (Scheduled Care Plan, On-Demand Care, or Both) when creating your care plan.
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="weekdayCoverage"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-medium">Primary Weekday Coverage</FormLabel>
              <FormDescription>
                Select your preferred weekday caregiver schedule
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  {weekdayCoverageOptions.map((option) => (
                    <FormItem
                      key={option.value}
                      className="flex flex-col items-start space-x-0 space-y-1 rounded-md border p-4"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <div className="space-y-0.5 w-full">
                          <FormLabel className="font-medium">
                            {option.label}
                          </FormLabel>
                          <FormDescription>
                            {option.description}
                          </FormDescription>
                        </div>
                      </div>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekendCoverage"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-medium">Weekend Coverage</FormLabel>
              <FormDescription>
                Do you need a primary weekend caregiver?
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem
                    className="flex flex-col items-start space-x-0 space-y-1 rounded-md border p-4"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <div className="space-y-0.5 w-full">
                        <FormLabel className="font-medium">
                          Yes: Saturday - Sunday, 6 AM - 6 PM
                        </FormLabel>
                        <FormDescription>
                          Daytime weekend coverage with a dedicated caregiver.
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                  <FormItem
                    className="flex flex-col items-start space-x-0 space-y-1 rounded-md border p-4"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <div className="space-y-0.5 w-full">
                        <FormLabel className="font-medium">
                          No Weekend Coverage
                        </FormLabel>
                        <FormDescription>
                          Skip regular weekend coverage.
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Custom Shifts</h3>
          <p className="text-sm text-muted-foreground">Define your own custom recurring shifts with specific days and times</p>
        </div>

        <FormField
          control={form.control}
          name="preferredDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Days</FormLabel>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-2">
                {days.map((day) => (
                  <FormItem
                    key={day.id}
                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(day.id)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, day.id]);
                          } else {
                            field.onChange(
                              currentValue.filter((value: string) => value !== day.id)
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{day.label}</FormLabel>
                  </FormItem>
                ))}
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preferredTimeStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredTimeEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftPreferencesSection;
