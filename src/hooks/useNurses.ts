
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Nurse {
  id: string;
  full_name: string;
}

export const useNurses = () => {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'professional')
          .order('full_name');

        if (error) throw error;

        setNurses(data || []);
      } catch (err: any) {
        console.error('Error fetching nurses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNurses();
  }, []);

  return { nurses, loading, error };
};
