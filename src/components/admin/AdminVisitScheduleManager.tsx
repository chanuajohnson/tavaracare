
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, List, Clock, BarChart3 } from "lucide-react";
import { Breadcrumb, useBreadcrumbs } from "@/components/ui/breadcrumb";
import { AdminCalendarView } from './AdminCalendarView';
import { AdminBookingTable } from './AdminBookingTable';
import { AdminScheduleSettings } from './AdminScheduleSettings';
import { AdminBookingFilters } from './AdminBookingFilters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

type AdminStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'locked';

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
  admin_status: AdminStatus;
  family_address?: string;
  family_phone?: string;
  admin_notes?: string;
  nurse_assigned?: string;
  confirmation_sent: boolean;
  profiles?: {
    full_name: string;
    email?: string;
  } | null;
}

interface BookingFilters {
  status: string;
  visitType: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  nurseAssigned: string;
  searchTerm: string;
}

export const AdminVisitScheduleManager = () => {
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("calendar");
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    visitType: '',
    dateRange: {},
    nurseAssigned: '',
    searchTerm: ''
  });

  const breadcrumbs = useBreadcrumbs();

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
      
      const transformedBookings = (data || []).map(booking => {
        let profileData = null;
        if (booking.profiles && typeof booking.profiles === 'object' && !Array.isArray(booking.profiles)) {
          profileData = booking.profiles as { full_name: string; email?: string };
        }
        
        return {
          ...booking,
          visit_type: booking.visit_type as 'virtual' | 'in_person',
          admin_status: booking.admin_status as AdminStatus,
          profiles: profileData
        };
      });
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load visit bookings');
    }
  };

  // Filter bookings based on current filters
  const filteredBookings = bookings.filter(booking => {
    if (filters.status && booking.admin_status !== filters.status) return false;
    if (filters.visitType && booking.visit_type !== filters.visitType) return false;
    if (filters.searchTerm && !booking.profiles?.full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
    if (filters.nurseAssigned) {
      if (filters.nurseAssigned === 'unassigned' && booking.nurse_assigned) return false;
      if (filters.nurseAssigned === 'assigned' && !booking.nurse_assigned) return false;
    }

    if (filters.dateRange.from) {
      const bookingDate = new Date(booking.booking_date);
      if (bookingDate < filters.dateRange.from) return false;
    }

    if (filters.dateRange.to) {
      const bookingDate = new Date(booking.booking_date);
      if (bookingDate > filters.dateRange.to) return false;
    }

    return true;
  });

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
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbs} />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visit Schedule Management</h1>
        <p className="text-muted-foreground">
          Manage family visit bookings, configure availability, and coordinate with nurses.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.admin_status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.admin_status === 'confirmed').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.booking_date);
                    const now = new Date();
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return bookingDate >= now && bookingDate <= weekFromNow;
                  }).length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            <BarChart3 className="h-4 w-4" />
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
                bookings={filteredBookings} 
                adminConfig={adminConfig}
                onBookingUpdate={handleBookingUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <AdminBookingFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalBookings={bookings.length}
            filteredCount={filteredBookings.length}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Visit Bookings Management</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminBookingTable 
                bookings={filteredBookings}
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
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon...</p>
                <p className="text-sm mt-2">Track booking trends, nurse performance, and capacity utilization.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
