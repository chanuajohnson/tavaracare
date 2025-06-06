
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';

interface VisitBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  status: string;
  reschedule_count: number;
  availability_slot_id: string;
  admin_status: string;
  is_cancelled: boolean;
}

export const useVisitBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visit_bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_cancelled', false)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching visit bookings:', err);
      setError('Failed to load visit bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const refetch = () => {
    fetchBookings();
  };

  // Get the most recent active booking
  const activeBooking = bookings.find(booking => 
    booking.status === 'confirmed' && !booking.is_cancelled
  );

  return {
    bookings,
    activeBooking,
    loading,
    error,
    refetch
  };
};
