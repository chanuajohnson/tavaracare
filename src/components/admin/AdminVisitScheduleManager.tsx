import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HorizontalTabs, HorizontalTabsContent, HorizontalTabsList, HorizontalTabsTrigger } from "@/components/ui/horizontal-scroll-tabs";
import { Calendar, Settings, List, Clock, BarChart3, AlertCircle, Users } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AdminCalendarView } from './AdminCalendarView';
import { AdminBookingTable } from './AdminBookingTable';
import { AdminScheduleSettings } from './AdminScheduleSettings';
import { AdminBookingFilters } from './AdminBookingFilters';
import { AdminSchedulingQueue } from './AdminSchedulingQueue';
import { ScheduleVisitDialog } from './ScheduleVisitDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  user_full_name: string;
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [filters, setFilters] = useState<BookingFilters>({
    status: '',
    visitType: '',
    dateRange: {},
    nurseAssigned: '',
    searchTerm: ''
  });

  // Create breadcrumb items
  const breadcrumbItems = [
    { label: 'Admin Dashboard', href: '/dashboard/admin' },
    { label: 'Visit Schedule Management', href: '/admin/visit-schedule', current: true }
  ];

  const fetchPendingRequestsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('ready_for_admin_scheduling', true)
        .eq('visit_scheduling_status', 'ready_to_schedule');

      if (error) throw error;
      setPendingRequestsCount(data?.length || 0);
    } catch (error: any) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  const fetchAdminConfig = async () => {
    try {
      console.log('Fetching admin visit config...');
      const { data, error } = await supabase
        .from('admin_visit_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching admin config:', error);
        throw error;
      }

      console.log('Admin config fetched:', data);
      setAdminConfig(data);
    } catch (error: any) {
      console.error('Error in fetchAdminConfig:', error);
      setError(`Failed to load admin configuration: ${error.message}`);
      toast.error('Failed to load admin configuration');
    }
  };

  const fetchBookings = async () => {
    try {
      console.log('Fetching visit bookings...');
      
      // Fetch bookings using the existing user_full_name field
      const { data, error } = await supabase
        .from('visit_bookings')
        .select(`
          id,
          user_id,
          user_full_name,
          booking_date,
          booking_time,
          visit_type,
          status,
          payment_status,
          admin_status,
          family_address,
          family_phone,
          admin_notes,
          nurse_assigned,
          confirmation_sent
        `)
        .order('booking_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Visit bookings table issue, setting empty array');
          setBookings([]);
          return;
        }
        throw error;
      }
      
      // Transform the data to match our interface
      const transformedBookings = (data || []).map(booking => ({
        ...booking,
        visit_type: booking.visit_type as 'virtual' | 'in_person',
        admin_status: booking.admin_status as AdminStatus,
        user_full_name: booking.user_full_name || 'Unknown User'
      }));
      
      console.log('Bookings fetched:', transformedBookings.length);
      setBookings(transformedBookings);
    } catch (error: any) {
      console.error('Error in fetchBookings:', error);
      setError(`Failed to load visit bookings: ${error.message}`);
      toast.error('Failed to load visit bookings');
      setBookings([]);
    }
  };

  // Filter bookings based on current filters
  const filteredBookings = bookings.filter(booking => {
    if (filters.status && booking.admin_status !== filters.status) return false;
    if (filters.visitType && booking.visit_type !== filters.visitType) return false;
    if (filters.searchTerm && !booking.user_full_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
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
      setError(null);
      
      try {
        await Promise.all([fetchAdminConfig(), fetchBookings(), fetchPendingRequestsCount()]);
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConfigUpdate = () => {
    fetchAdminConfig();
    toast.success('Schedule configuration updated successfully');
  };

  const handleBookingUpdate = () => {
    fetchBookings();
    fetchPendingRequestsCount(); // Also refresh pending count
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header with Schedule Button */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Visit Schedule Management</h1>
            <p className="text-muted-foreground">
              Manage family visit bookings, configure availability, and coordinate with nurses.
            </p>
          </div>
          <ScheduleVisitDialog onVisitScheduled={handleBookingUpdate} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-sm text-muted-foreground">Pending Scheduling</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRequestsCount}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
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

      <HorizontalTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <HorizontalTabsList className="grid w-full grid-cols-5">
          <HorizontalTabsTrigger value="calendar">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Calendar</span>
          </HorizontalTabsTrigger>
          <HorizontalTabsTrigger value="queue" className="relative">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Queue</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </HorizontalTabsTrigger>
          <HorizontalTabsTrigger value="bookings">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Bookings</span>
          </HorizontalTabsTrigger>
          <HorizontalTabsTrigger value="settings">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Settings</span>
          </HorizontalTabsTrigger>
          <HorizontalTabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Analytics</span>
          </HorizontalTabsTrigger>
        </HorizontalTabsList>

        <HorizontalTabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              {adminConfig ? (
                <AdminCalendarView 
                  bookings={filteredBookings} 
                  adminConfig={adminConfig}
                  onBookingUpdate={handleBookingUpdate}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admin configuration found. Please configure schedule settings first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </HorizontalTabsContent>

        <HorizontalTabsContent value="queue" className="space-y-6">
          <AdminSchedulingQueue onRequestScheduled={handleBookingUpdate} />
        </HorizontalTabsContent>

        <HorizontalTabsContent value="bookings" className="space-y-6">
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
        </HorizontalTabsContent>

        <HorizontalTabsContent value="settings" className="space-y-6">
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
        </HorizontalTabsContent>

        <HorizontalTabsContent value="analytics" className="space-y-6">
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
        </HorizontalTabsContent>
      </HorizontalTabs>
    </div>
  );
};
