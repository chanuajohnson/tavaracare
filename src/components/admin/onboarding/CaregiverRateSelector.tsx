
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock } from 'lucide-react';

interface ShiftHoursInfo {
  label: string;
  hoursPerDay: number;
  daysPerWeek: number;
  weeklyHours: number;
}

const SHIFT_HOURS_MAP: Record<string, ShiftHoursInfo> = {
  mon_fri_8am_4pm: { label: 'Mon-Fri 8AM-4PM', hoursPerDay: 8, daysPerWeek: 5, weeklyHours: 40 },
  mon_fri_8am_6pm: { label: 'Mon-Fri 8AM-6PM', hoursPerDay: 10, daysPerWeek: 5, weeklyHours: 50 },
  mon_fri_6am_6pm: { label: 'Mon-Fri 6AM-6PM', hoursPerDay: 12, daysPerWeek: 5, weeklyHours: 60 },
  sat_sun_8am_4pm: { label: 'Sat-Sun 8AM-4PM', hoursPerDay: 8, daysPerWeek: 2, weeklyHours: 16 },
  sat_sun_6am_6pm: { label: 'Sat-Sun 6AM-6PM', hoursPerDay: 12, daysPerWeek: 2, weeklyHours: 24 },
  sat_sun_8am_6pm: { label: 'Sat-Sun 8AM-6PM', hoursPerDay: 10, daysPerWeek: 2, weeklyHours: 20 },
  weekday_evening_4pm_6am: { label: 'Weekday 4PM-6AM', hoursPerDay: 14, daysPerWeek: 5, weeklyHours: 70 },
  weekday_evening_4pm_8am: { label: 'Weekday 4PM-8AM', hoursPerDay: 16, daysPerWeek: 5, weeklyHours: 80 },
  weekday_evening_5pm_5am: { label: 'Weekday 5PM-5AM', hoursPerDay: 12, daysPerWeek: 5, weeklyHours: 60 },
  weekday_evening_5pm_8am: { label: 'Weekday 5PM-8AM', hoursPerDay: 15, daysPerWeek: 5, weeklyHours: 75 },
  weekday_evening_6pm_6am: { label: 'Weekday 6PM-6AM', hoursPerDay: 12, daysPerWeek: 5, weeklyHours: 60 },
  weekday_evening_6pm_8am: { label: 'Weekday 6PM-8AM', hoursPerDay: 14, daysPerWeek: 5, weeklyHours: 70 },
  weekend_evening_4pm_6am: { label: 'Weekend 4PM-6AM', hoursPerDay: 14, daysPerWeek: 2, weeklyHours: 28 },
  weekend_evening_6pm_6am: { label: 'Weekend 6PM-6AM', hoursPerDay: 12, daysPerWeek: 2, weeklyHours: 24 },
  flexible: { label: 'Flexible', hoursPerDay: 8, daysPerWeek: 5, weeklyHours: 40 },
  live_in_care: { label: 'Live-In Care', hoursPerDay: 12, daysPerWeek: 7, weeklyHours: 84 },
  '24_7_care': { label: '24/7 Care', hoursPerDay: 24, daysPerWeek: 7, weeklyHours: 168 },
  around_clock_shifts: { label: 'Around-the-Clock', hoursPerDay: 24, daysPerWeek: 7, weeklyHours: 168 },
};

const RATE_OPTIONS = [
  { value: '$35/hr (Legacy)', label: '$35/hr (Legacy)', rate: 35 },
  { value: '$40/hr (Standard)', label: '$40/hr (Standard)', rate: 40 },
  { value: '$45/hr (Full Service)', label: '$45/hr (Full Service)', rate: 45 },
  { value: '$50+/hr (Premium)', label: '$50+/hr (Premium)', rate: 50 },
  { value: 'custom', label: 'Custom Rate', rate: 0 },
];

interface CaregiverRateSelectorProps {
  careSchedule?: string;
  currentRate?: string;
  onRateChange: (rateString: string) => void;
}

export function parseRateFromString(rateStr: string): number {
  const match = rateStr.match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

export function getWeeklyHoursFromSchedule(careSchedule?: string): number {
  if (!careSchedule) return 40; // default
  // care_schedule can be comma-separated
  const shifts = careSchedule.split(',').map(s => s.trim()).filter(Boolean);
  let total = 0;
  for (const shift of shifts) {
    const info = SHIFT_HOURS_MAP[shift];
    if (info) total += info.weeklyHours;
  }
  return total || 40;
}

export function getShiftLabelsFromSchedule(careSchedule?: string): string[] {
  if (!careSchedule) return ['Not set'];
  const shifts = careSchedule.split(',').map(s => s.trim()).filter(Boolean);
  return shifts.map(s => SHIFT_HOURS_MAP[s]?.label || s).filter(Boolean);
}

export default function CaregiverRateSelector({ careSchedule, currentRate, onRateChange }: CaregiverRateSelectorProps) {
  const [customRate, setCustomRate] = useState('');
  const isCustom = currentRate === 'custom' || (currentRate && !RATE_OPTIONS.some(o => o.value === currentRate && o.value !== 'custom'));

  const weeklyHours = getWeeklyHoursFromSchedule(careSchedule);
  const shiftLabels = getShiftLabelsFromSchedule(careSchedule);
  const hourlyRate = currentRate ? parseRateFromString(currentRate) : 0;
  const weeklyLabor = hourlyRate * weeklyHours;

  const handleSelect = (value: string) => {
    if (value === 'custom') {
      onRateChange('custom');
    } else {
      onRateChange(value);
    }
  };

  const handleCustomSubmit = () => {
    const num = parseFloat(customRate);
    if (num > 0) {
      onRateChange(`$${num}/hr (Custom)`);
    }
  };

  const displayValue = isCustom && currentRate !== 'custom' ? currentRate : 
    RATE_OPTIONS.find(o => o.value === currentRate)?.value || '';

  return (
    <div className="mt-4 mb-2 rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <h5 className="text-sm font-semibold flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-primary" />
        Caregiver Rate Selection
      </h5>

      {/* Shift context */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div>
          <span className="font-medium">Active shift: </span>
          {shiftLabels.join(' + ')}
          <span className="ml-1">({weeklyHours} hrs/wk)</span>
        </div>
      </div>

      {/* Rate selector */}
      <div className="space-y-2">
        <Label className="text-xs">Hourly Rate</Label>
        <Select value={isCustom ? 'custom' : (currentRate || '')} onValueChange={handleSelect}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select caregiver rate" />
          </SelectTrigger>
          <SelectContent>
            {RATE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom rate input */}
      {(currentRate === 'custom' || (isCustom && !currentRate?.includes('Custom'))) && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">$</span>
          <Input
            type="number"
            placeholder="Enter rate"
            value={customRate}
            onChange={(e) => setCustomRate(e.target.value)}
            onBlur={handleCustomSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            className="h-8 w-32"
          />
          <span className="text-sm text-muted-foreground">/hr</span>
        </div>
      )}

      {/* Calculated weekly labor */}
      {hourlyRate > 0 && (
        <div className="rounded-md bg-background border p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Caregiver Rate</span>
            <span className="font-medium">${hourlyRate.toFixed(2)}/hr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weekly Hours</span>
            <span className="font-medium">{weeklyHours} hrs</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
            <span>Weekly Caregiver Labor</span>
            <span className="text-primary">${weeklyLabor.toFixed(2)}/wk</span>
          </div>
        </div>
      )}

      {currentRate && hourlyRate > 0 && (
        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
          ✓ Rate saved: {currentRate}
        </Badge>
      )}
    </div>
  );
}
