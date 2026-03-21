import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, X, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchInfo {
  id: string;
  caregiver_id: string;
  match_score: number;
  assignment_type: string;
  created_at: string;
  caregiver_name?: string;
}

export const FamilyMatchNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('caregiver_assignments')
        .select('id, caregiver_id, match_score, assignment_type, created_at')
        .eq('family_user_id', user.id)
        .eq('is_active', true)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      if (data && data.length > 0) {
        // Fetch caregiver names
        const caregiverIds = data.map(m => m.caregiver_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, professional_type, available_for_matching')
          .in('id', caregiverIds);

        // Filter to only available caregivers
        const availableProfiles = (profiles || []).filter(p => p.available_for_matching !== false);

        const typeMap: Record<string, string> = {
          gapp: "GAPP Certified",
          nurse: "Registered Nurse",
          cna: "Certified Nursing Assistant",
          aide: "Professional Care Aide",
          hha: "Home Health Aide",
          elderly: "Elderly Care Specialist",
          special_needs: "Special Needs Caregiver",
          companion: "Companion Caregiver",
          live_in: "Live-in Caregiver",
          other: "Professional Caregiver",
        };
        const getLabel = (type: string | null) => {
          if (!type) return 'Professional Caregiver';
          return typeMap[type.toLowerCase()] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        };

        const profileMap = new Map(profiles?.map(p => [p.id, getLabel(p.professional_type)]) || []);

        setMatches(data.map(m => ({
          ...m,
          caregiver_name: profileMap.get(m.caregiver_id) || 'Professional Caregiver'
        })));
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('Error in FamilyMatchNotification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  // Real-time subscription for new matches
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('family-match-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'caregiver_assignments',
          filter: `family_user_id=eq.${user.id}`
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading || dismissed || matches.length === 0) return null;

  const now = new Date();
  const newMatches = matches.filter(m => {
    const created = new Date(m.created_at);
    return (now.getTime() - created.getTime()) < 48 * 60 * 60 * 1000;
  });

  const viewMatches = () => {
    const el = document.getElementById('family-caregiver-matches');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/family/matching');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                  <Users className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-emerald-900">
                      You have {matches.length} caregiver match{matches.length !== 1 ? 'es' : ''}!
                    </h3>
                    {newMatches.length > 0 && (
                      <Badge className="bg-emerald-600 text-white text-xs px-1.5 py-0">
                        <Sparkles className="h-3 w-3 mr-0.5" />
                        {newMatches.length} New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    {matches.slice(0, 3).map(m => m.caregiver_name).join(', ')}
                    {matches.length > 3 ? ` and ${matches.length - 3} more` : ''}
                    {' — '}matched based on your care needs.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-emerald-700 font-medium mt-1"
                    onClick={viewMatches}
                  >
                    View your matches <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
