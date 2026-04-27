
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { ProfessionalFamilyChatService, FamilyChatRequest } from '@/services/professionalFamilyChatService';

export const useProfessionalChatRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FamilyChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const chatRequests = await ProfessionalFamilyChatService.getFamilyChatRequests();
      setRequests(chatRequests);
    } catch (err) {
      console.error('Error fetching chat requests:', err);
      setError('Failed to load chat requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('family-chat-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_chat_requests',
          filter: `family_user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Chat request change:', payload);
          fetchRequests(); // Refresh requests when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const acceptRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await ProfessionalFamilyChatService.acceptChatRequest(requestId);
      if (result.success) {
        await fetchRequests(); // Refresh the list
      }
      return result;
    } catch (error) {
      console.error('Error accepting request:', error);
      return { success: false, error: 'Failed to accept request' };
    }
  };

  const declineRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await ProfessionalFamilyChatService.declineChatRequest(requestId);
      if (result.success) {
        await fetchRequests(); // Refresh the list
      }
      return result;
    } catch (error) {
      console.error('Error declining request:', error);
      return { success: false, error: 'Failed to decline request' };
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const recentRequests = requests.filter(req => req.status !== 'pending');

  return {
    requests,
    pendingRequests,
    recentRequests,
    loading,
    error,
    acceptRequest,
    declineRequest,
    refetch: fetchRequests,
  };
};
