
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const PayrollRealtimeInitializer = () => {
  useEffect(() => {
    // Enable realtime for work_logs
    const enableRealtime = async () => {
      try {
        await supabase.rpc('supabase_realtime.enable_subscription', {
          table: 'work_logs',
          schema: 'public'
        });
        console.log('Realtime enabled for work_logs');
      } catch (error) {
        console.error('Failed to enable realtime for work_logs:', error);
      }
    };

    enableRealtime();
  }, []);

  return null;
};
