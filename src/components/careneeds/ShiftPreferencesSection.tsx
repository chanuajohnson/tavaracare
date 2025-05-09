
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

// Standard care coverage options that match the care plan creation page
const weekdayCoverageOptions = [
  { value: "8am-4pm", label: "8AM-4PM" },
  { value: "8am-6pm", label: "8AM-6PM" },
  { value: "6am-6pm", label: "6AM-6PM" },
  { value: "6pm-8am", label: "6PM-8AM (Overnight)" },
  { value: "none", label: "No Regular Coverage" }
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
        <FormField
          control={form.control}
          name="preferredDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Days</FormLabel>
              <FormDescription>Select the days when care is needed</FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
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

        <FormField
          control={form.control}
          name="weekdayCoverage"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Weekday Coverage</FormLabel>
              <FormDescription>
                Select your preferred time range for weekday care
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {weekdayCoverageOptions.map((option) => (
                    <FormItem
                      key={option.value}
                      className="flex items-center space-x-3 space-y-0 rounded-md border p-3"
                    >
                      <FormControl>
                        <RadioGroupItem value={option.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
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
              <FormLabel>Weekend Coverage</FormLabel>
              <FormDescription>
                Do you need care coverage on weekends?
              </FormDescription>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem
                    className="flex items-center space-x-3 space-y-0 rounded-md border p-3"
                  >
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Yes (6AM-6PM)
                    </FormLabel>
                  </FormItem>
                  <FormItem
                    className="flex items-center space-x-3 space-y-0 rounded-md border p-3"
                  >
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      No
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preferredTimeStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Start Time (Optional)</FormLabel>
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
                <FormLabel>Custom End Time (Optional)</FormLabel>
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
