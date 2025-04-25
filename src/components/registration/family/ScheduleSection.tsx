
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Sun, Moon, Clock } from "lucide-react";

interface ScheduleSectionProps {
  careSchedule: string[];
  customSchedule: string;
  onCareScheduleChange: (value: string) => void;
  onCustomScheduleChange: (value: string) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  careSchedule,
  customSchedule,
  onCareScheduleChange,
  onCustomScheduleChange,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Care Schedule & Availability</CardTitle>
        <CardDescription>
          Select your preferred care hours to help us match you with available caregivers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Standard Weekday Shifts</span>
            </div>
            <div className="pl-7 space-y-3">
              {[
                { id: 'weekday-standard', label: '☀️ Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)', value: 'weekday_standard' },
                { id: 'weekday-8am-6pm', label: '☀️ Monday – Friday, 8 AM – 6 PM (Standard daytime coverage with extended hours)', value: 'weekday_8am_6pm' },
                { id: 'weekday-extended', label: '🕕 Monday – Friday, 6 AM – 6 PM (Extended daytime coverage)', value: 'weekday_extended' }
              ].map((shift) => (
                <div key={shift.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={shift.id} 
                    checked={careSchedule.includes(shift.value)}
                    onCheckedChange={() => onCareScheduleChange(shift.value)}
                  />
                  <Label htmlFor={shift.id} className="font-normal">
                    {shift.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <span className="font-medium">Weekend Shifts</span>
            </div>
            <div className="pl-7 space-y-3">
              {[
                { id: 'weekend-day-8-6', label: '🌞 Saturday – Sunday, 8 AM – 6 PM (Weekend daytime coverage)', value: 'weekend_8_6' },
                { id: 'weekend-day', label: '🌞 Saturday – Sunday, 6 AM – 6 PM (Extended weekend coverage)', value: 'weekend_day' }
              ].map((shift) => (
                <div key={shift.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={shift.id} 
                    checked={careSchedule.includes(shift.value)}
                    onCheckedChange={() => onCareScheduleChange(shift.value)}
                  />
                  <Label htmlFor={shift.id} className="font-normal">
                    {shift.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <span className="font-medium">Evening & Overnight Shifts</span>
            </div>
            <div className="pl-7 space-y-3">
              {[
                { id: 'evening-4-6', label: '🌙 Weekday Evening Shift (4 PM – 6 AM)', value: 'evening_4_6' },
                { id: 'evening-4-8', label: '🌙 Weekday Evening Shift (4 PM – 8 AM)', value: 'evening_4_8' },
                { id: 'evening-6-6', label: '🌙 Weekday Evening Shift (6 PM – 6 AM)', value: 'evening_6_6' },
                { id: 'evening-6-8', label: '🌙 Weekday Evening Shift (6 PM – 8 AM)', value: 'evening_6_8' }
              ].map((shift) => (
                <div key={shift.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={shift.id} 
                    checked={careSchedule.includes(shift.value)}
                    onCheckedChange={() => onCareScheduleChange(shift.value)}
                  />
                  <Label htmlFor={shift.id} className="font-normal">
                    {shift.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Other Options</span>
            </div>
            <div className="pl-7 space-y-3">
              {[
                { id: 'flexible', label: '⏳ Flexible / On-Demand Availability', value: 'flexible' },
                { id: 'live-in', label: '🏡 Live-In Care (Full-time in-home support)', value: 'live_in' },
                { id: 'custom', label: '✏️ Other (Custom shift — specify your hours)', value: 'custom' }
              ].map((option) => (
                <div key={option.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={careSchedule.includes(option.value)}
                    onCheckedChange={() => onCareScheduleChange(option.value)}
                  />
                  <Label htmlFor={option.id} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>

            {careSchedule.includes('custom') && (
              <div className="pt-2 pl-6">
                <Label htmlFor="customSchedule" className="text-sm mb-1 block">Please specify your custom schedule:</Label>
                <Textarea
                  id="customSchedule"
                  placeholder="Describe your specific schedule needs"
                  value={customSchedule}
                  onChange={(e) => onCustomScheduleChange(e.target.value)}
                  rows={2}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
