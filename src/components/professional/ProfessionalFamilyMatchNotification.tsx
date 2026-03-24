import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FamilyMatchInfo {
  id: string;
  family_user_id: string;
  match_score: number;
  assignment_type: string;
  created_at: string;
  family_name?: string;
}

export const ProfessionalFamilyMatchNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<FamilyMatchInfo[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    if (!user?.id) return;

    try {
      // Get active assignments for this professional
      const { data, error } = await supabase
        .from('caregiver_assignments')
        .select('id, family_user_id, match_score, assignment_type, created_at')
        .eq('caregiver_id', user.id)
        .eq('is_active', true)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching professional matches:', error);
        return;
      }

      if (data && data.length > 0) {
        // Get family names via the public RPC (privacy-safe)
        const familyIds = [...new Set(data.map(m => m.family_user_id))];
        const { data: families } = await supabase
          .rpc('get_public_family_profiles');

        const familyMap = new Map(
          (families || []).map((f: any) => [f.id, f.full_name || 'Family'])
        );

        // Deduplicate by family_user_id, keep highest match score
        const uniqueMap = new Map<string, FamilyMatchInfo>();
        for (const m of data) {
          const existing = uniqueMap.get(m.family_user_id);
          if (!existing || m.match_score > existing.match_score) {
            uniqueMap.set(m.family_user_id, {
              ...m,
              family_name: familyMap.get(m.family_user_id) || 'Family'
            });
          }
        }

        setMatches(Array.from(uniqueMap.values()));
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('Error in ProfessionalFamilyMatchNotification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('professional-family-match-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'caregiver_assignments',
          filter: `caregiver_id=eq.${user.id}`
        },
        () => fetchMatches()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
      navigate('/urgent-families');
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
                  <Heart className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-emerald-900">
                      You have {matches.length} family match{matches.length !== 1 ? 'es' : ''}!
                    </h3>
                    {newMatches.length > 0 && (
                      <Badge className="bg-emerald-600 text-white text-xs px-1.5 py-0">
                        <Sparkles className="h-3 w-3 mr-0.5" />
                        {newMatches.length} New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    {matches.slice(0, 3).map(m => m.family_name).join(', ')}
                    {matches.length > 3 ? ` and ${matches.length - 3} more` : ''}
                    {' — '}matched based on your skills and availability.
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
