
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, List, Clock } from "lucide-react";
import { AdminCalendarView } from './AdminCalendarView';
import { AdminBookingTable } from './AdminBookingTable';
import { AdminScheduleSettings } from './AdminScheduleSettings';
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

interface VisitBooking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  status: string;
  payment_status: string;
  family_address?: string;
  family_phone?: string;
  admin_notes?: string;
  admin_status: string;
  nurse_assigned?: string;
  confirmation_sent: boolean;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

export const AdminVisitScheduleManager = () => {
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_visit_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setAdminConfig(data);
    } catch (error) {
      console.error('Error fetching admin config:', error);
      toast.error('Failed to load admin configuration');
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_bookings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      
      // Transform the data to ensure proper typing and handle nullable profiles
      const transformedBookings = (data || []).map(booking => {
        // Handle the case where profiles might be null or have an error structure
        let profileData = null;
        if (booking.profiles && typeof booking.profiles === 'object' && !('error' in booking.profiles)) {
          profileData = booking.profiles as { full_name: string; email?: string };
        }
        
        return {
          ...booking,
          visit_type: booking.visit_type as 'virtual' | 'in_person',
          profiles: profileData
        };
      });
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load visit bookings');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAdminConfig(), fetchBookings()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleConfigUpdate = () => {
    fetchAdminConfig();
    toast.success('Schedule configuration updated successfully');
  };

  const handleBookingUpdate = () => {
    fetchBookings();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visit Schedule Management</h1>
        <p className="text-muted-foreground">
          Manage family visit bookings, configure availability, and coordinate with nurses.
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Bookings
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Schedule Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminCalendarView 
                bookings={bookings} 
                adminConfig={adminConfig}
                onBookingUpdate={handleBookingUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Bookings Management</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminBookingTable 
                bookings={bookings}
                onBookingUpdate={handleBookingUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminScheduleSettings 
                adminConfig={adminConfig}
                onConfigUpdate={handleConfigUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
