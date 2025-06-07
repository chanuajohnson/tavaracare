
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Save, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface AdminConfig {
  id: string;
  available_days: string[];
  start_time: string;
  end_time: string;
  max_bookings_per_day: number;
  advance_booking_days: number;
}

interface AdminScheduleSettingsProps {
  adminConfig: AdminConfig | null;
  onConfigUpdate: () => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const AdminScheduleSettings: React.FC<AdminScheduleSettingsProps> = ({
  adminConfig,
  onConfigUpdate
}) => {
  const [config, setConfig] = useState<Partial<AdminConfig>>(adminConfig || {});
  const [loading, setLoading] = useState(false);
  const [blockedDate, setBlockedDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockedDates, setBlockedDates] = useState<any[]>([]);

  React.useEffect(() => {
    if (adminConfig) {
      setConfig(adminConfig);
    }
    fetchBlockedDates();
  }, [adminConfig]);

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  const handleSaveConfig = async () => {
    if (!adminConfig?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_visit_config')
        .update({
          available_days: config.available_days,
          start_time: config.start_time,
          end_time: config.end_time,
          max_bookings_per_day: config.max_bookings_per_day,
          advance_booking_days: config.advance_booking_days,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminConfig.id);

      if (error) throw error;

      toast.success('Schedule configuration saved successfully');
      onConfigUpdate();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    const newDays = checked 
      ? [...(config.available_days || []), day]
      : (config.available_days || []).filter(d => d !== day);
    
    setConfig(prev => ({ ...prev, available_days: newDays }));
  };

  const handleBlockDate = async () => {
    if (!blockedDate) return;

    try {
      const { error } = await supabase
        .from('admin_blocked_dates')
        .insert({
          date: blockedDate,
          reason: blockReason || null
        });

      if (error) throw error;

      toast.success('Date blocked successfully');
      setBlockedDate('');
      setBlockReason('');
      fetchBlockedDates();
    } catch (error) {
      console.error('Error blocking date:', error);
      toast.error('Failed to block date');
    }
  };

  const handleUnblockDate = async (dateId: string) => {
    try {
      const { error } = await supabase
        .from('admin_blocked_dates')
        .delete()
        .eq('id', dateId);

      if (error) throw error;

      toast.success('Date unblocked successfully');
      fetchBlockedDates();
    } catch (error) {
      console.error('Error unblocking date:', error);
      toast.error('Failed to unblock date');
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Available Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={(config.available_days || []).includes(day)}
                  onCheckedChange={(checked) => handleDayToggle(day, !!checked)}
                />
                <Label htmlFor={day} className="text-sm font-medium">
                  {day}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Selected days: {(config.available_days || []).join(', ') || 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={config.start_time || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={config.end_time || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-bookings">Max Bookings per Day</Label>
              <Input
                id="max-bookings"
                type="number"
                min="1"
                max="10"
                value={config.max_bookings_per_day || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, max_bookings_per_day: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance-days">Advance Booking Days</Label>
              <Input
                id="advance-days"
                type="number"
                min="1"
                max="30"
                value={config.advance_booking_days || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, advance_booking_days: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={blockedDate}
              onChange={(e) => setBlockedDate(e.target.value)}
              placeholder="Select date to block"
            />
            <Input
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason (optional)"
            />
            <Button onClick={handleBlockDate} disabled={!blockedDate}>
              <Plus className="h-4 w-4 mr-1" />
              Block
            </Button>
          </div>

          <div className="space-y-2">
            {blockedDates.length > 0 ? (
              blockedDates.map(blocked => (
                <div key={blocked.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{blocked.date}</span>
                    {blocked.reason && (
                      <span className="text-sm text-muted-foreground ml-2">- {blocked.reason}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblockDate(blocked.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No blocked dates</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Available Days:</strong></p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(config.available_days || []).map(day => (
                  <Badge key={day} variant="secondary">{day}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p><strong>Time Window:</strong> {config.start_time} - {config.end_time}</p>
              <p><strong>Max Bookings:</strong> {config.max_bookings_per_day} per day</p>
              <p><strong>Advance Booking:</strong> {config.advance_booking_days} days</p>
              <p><strong>Blocked Dates:</strong> {blockedDates.length} dates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
