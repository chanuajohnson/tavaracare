import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, UserCheck, Calendar, MessageSquare, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

interface ManualMatch {
  id: string;
  family_user_id: string;
  admin_match_score: number;
  created_at: string;
  reason: string;
  notes: string;
  family_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    care_recipient_name: string;
    location: string;
    care_types: string[] | null;
  };
}

export const ManualMatchNotification = () => {
  const { user } = useAuth();
  const [manualMatches, setManualMatches] = useState<ManualMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedMatches, setDismissedMatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const loadManualMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_match_interventions')
          .select(`
            id,
            family_user_id,
            admin_match_score,
            created_at,
            reason,
            notes,
            family_profile:profiles!admin_match_interventions_family_user_id_fkey(
              id,
              full_name,
              avatar_url,
              care_recipient_name,
              location,
              care_types
            )
          `)
          .eq('caregiver_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading manual matches:', error);
          return;
        }

        console.log('Manual matches loaded:', data);
        setManualMatches(data || []);
      } catch (error) {
        console.error('Exception loading manual matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadManualMatches();

    // Set up real-time subscription for new manual matches
    const channel = supabase
      .channel('manual-matches')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_match_interventions',
        filter: `caregiver_id=eq.${user.id}`
      }, (payload) => {
        console.log('New manual match received:', payload);
        toast.success('You have a new family assignment!');
        loadManualMatches(); // Reload to get complete data
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDismiss = (matchId: string) => {
    setDismissedMatches(prev => new Set(prev).add(matchId));
  };

  const visibleMatches = manualMatches.filter(match => !dismissedMatches.has(match.id));

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-sm text-gray-500">Loading assignments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleMatches.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-orange-600" />
            New Family Assignment{visibleMatches.length > 1 ? 's' : ''}
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {visibleMatches.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleMatches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 p-4 bg-white rounded-lg border border-orange-200 relative"
            >
              <Avatar className="h-12 w-12 border-2 border-orange-200">
                <AvatarImage src={match.family_profile?.avatar_url || ''} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {match.family_profile?.full_name?.substring(0, 2) || '??'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {match.family_profile?.full_name || 'Unknown Family'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Care for: {match.family_profile?.care_recipient_name || 'Care recipient'}
                    </p>
                    <p className="text-sm text-gray-500">
                      📍 {match.family_profile?.location || 'Location not specified'}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(match.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Manual Assignment
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {match.admin_match_score}% Match
                  </Badge>
                </div>
                
                {match.reason && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Reason:</strong> {match.reason}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Contact Family
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};