
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSchedulingQueue } from './AdminSchedulingQueue';
import { AdminCalendarView } from './AdminCalendarView';
import { AdminScheduleSettings } from './AdminScheduleSettings';
import { AdminMatchingQueue } from './AdminMatchingQueue';
import { Calendar, Users, Settings, UserCheck, Clock } from 'lucide-react';

export const AdminVisitScheduleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash for specific tab
    const hash = window.location.hash;
    if (hash === '#queue') return 'queue';
    if (hash === '#calendar') return 'calendar';
    if (hash === '#matching') return 'matching';
    if (hash === '#settings') return 'settings';
    return 'queue';
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash without triggering navigation
    window.history.replaceState(null, '', `#${value}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visit & Matching Management</h1>
        <p className="text-muted-foreground">
          Manage family visit bookings, caregiver matching, and scheduling configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Visit Queue
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Matching Queue
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <AdminSchedulingQueue />
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <AdminMatchingQueue />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <AdminCalendarView />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminScheduleSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
