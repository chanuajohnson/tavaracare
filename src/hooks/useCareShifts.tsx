
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CareShift } from "@/services/care-plan-service";
import { useAuth } from "@/components/providers/AuthProvider";

export function useCareShifts() {
  const [shifts, setShifts] = useState<CareShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCareShifts = async () => {
      try {
        setLoading(true);
        
        // Get current date at beginning of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log("🔄 Fetching care shifts:", {
          userId: user.id,
          environment: import.meta.env.VITE_ENV,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 20) + '...'
        });
        
        const { data, error: shiftsError } = await supabase
          .from('care_shifts')
          .select('*')
          .eq('caregiver_id', user.id)
          .gte('start_time', today.toISOString())
          .order('start_time', { ascending: true });
        
        if (shiftsError) {
          throw shiftsError;
        }
        
        console.log(`✅ Care shifts fetched: ${data?.length || 0} shifts found for user ${user.id}`);
        
        // Cast the returned data to match our CareShift type
        const typedShifts: CareShift[] = data ? data.map(shift => ({
          ...shift,
          status: shift.status as 'open' | 'assigned' | 'completed' | 'cancelled',
        })) : [];
        
        setShifts(typedShifts);
      } catch (err: any) {
        console.error("❌ Error fetching care shifts:", err);
        setError(err.message || "Failed to load care shifts");
        toast.error("Failed to load care shifts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCareShifts();
    
    // Set up real-time subscription for care shifts updates
    const careShiftsSubscription = supabase
      .channel('care_shifts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'care_shifts',
          filter: `caregiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log("🔄 Real-time update received for care shifts:", payload);
          // Reload shifts when there's a change
          fetchCareShifts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(careShiftsSubscription);
    };
  }, [user]);

  return { shifts, loading, error };
}
