import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CognitiveMemorySectionProps } from "@/types/careNeedsTypes";

const CognitiveMemorySection: React.FC<CognitiveMemorySectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cognitive & Memory Support</CardTitle>
        <CardDescription>Indicate if cognitive and memory support is needed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dementia_redirection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Dementia Redirection</FormLabel>
                  <FormDescription>
                    Redirection strategies for dementia-related behavior
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memory_reminders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Memory Reminders</FormLabel>
                  <FormDescription>
                    Assistance with remembering tasks and routines
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gentle_engagement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Gentle Engagement</FormLabel>
                  <FormDescription>
                    Meaningful activities and gentle interaction
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wandering_prevention"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Wandering Prevention</FormLabel>
                  <FormDescription>
                    Support to prevent wandering or getting lost
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cognitive_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Triggers and Soothing Techniques</FormLabel>
              <FormDescription>
                Please describe any known triggers and effective soothing techniques
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="E.g., Becomes agitated when rushed; responds well to gentle music and slow speaking"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default CognitiveMemorySection;
