import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MedicalConditionsSectionProps } from "@/types/careNeedsTypes";

const MedicalConditionsSection: React.FC<MedicalConditionsSectionProps> = ({ form }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Medical & Special Conditions</CardTitle>
        <CardDescription>Describe any medical conditions and special health needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="diagnosed_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Conditions</FormLabel>
              <FormDescription>
                List any diagnosed conditions or health concerns
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="E.g., Diabetes, COPD, mild dementia, high blood pressure"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-3" />
        
        <div>
          <h4 className="text-sm font-medium mb-3">Care Monitoring Requirements</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="equipment_use"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Equipment Use</FormLabel>
                    <FormDescription>
                      Needs help with medical equipment
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fall_monitoring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Fall Risk</FormLabel>
                    <FormDescription>
                      Requires monitoring for fall prevention
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vitals_check"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Vitals Monitoring</FormLabel>
                    <FormDescription>
                      Regular monitoring of vital signs
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalConditionsSection;
