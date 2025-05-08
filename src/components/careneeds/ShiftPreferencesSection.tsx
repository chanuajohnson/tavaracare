
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preferredTimeStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Start Time</FormLabel>
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
                <FormLabel>Preferred End Time</FormLabel>
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
