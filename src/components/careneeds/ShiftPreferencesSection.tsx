
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShiftPreferencesSectionProps {
  form: any;
}

// Standard care coverage options that match the care plan creation page exactly
const weekdayCoverageOptions = [
  { value: "8am-4pm", label: "Option 1: Monday - Friday, 8 AM - 4 PM", description: "Standard daytime coverage during business hours." },
  { value: "8am-6pm", label: "Option 2: Monday - Friday, 8 AM - 6 PM", description: "Extended daytime coverage with later end time." },
  { value: "6am-6pm", label: "Option 3: Monday - Friday, 6 AM - 6 PM", description: "Extended daytime coverage for more comprehensive care." },
  { value: "6pm-8am", label: "Option 4: Monday - Friday, 6 PM - 8 AM", description: "Extended nighttime coverage to relieve standard daytime coverage." },
  { value: "none", label: "No Weekday Coverage", description: "Skip weekday coverage and use on-demand or other shifts." }
];

const ShiftPreferencesSection: React.FC<ShiftPreferencesSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Schedule Preferences</CardTitle>
        <CardDescription>Tell us when you need care assistance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your schedule preferences will be used to create your initial care plan. You can customize your care plan further after it's created.
          </AlertDescription>
        </Alert>

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
      </CardContent>
    </Card>
  );
};

export default ShiftPreferencesSection;
