import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Users, Clock, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { ProfessionalCaregiverChatModal } from './ProfessionalCaregiverChatModal';

interface ActiveSession {
  id: string;
  family_user_id: string;
  session_date: string;
  messages_sent: number;
  max_daily_messages: number;
  is_premium: boolean;
  last_message?: {
    content: string;
    created_at: string;
    is_user: boolean;
    sender: string;
  };
  family_profile?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count: number;
}

export const ActiveChatSessionsSection = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState<{ id: string; full_name: string; avatar_url?: string } | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchActiveSessions();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('professional-chat-updates')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'caregiver_chat_messages',
            filter: `session_id=in.(${sessions.map(s => s.id).join(',')})`
          },
          () => {
            fetchActiveSessions(); // Refresh sessions when new messages arrive
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchActiveSessions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('[ActiveChatSessions] Fetching sessions for caregiver:', user.id);
      
      // Get active chat sessions for this caregiver
      // Fix: Convert user.id (UUID) to string to match caregiver_id (text) field
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('caregiver_chat_sessions')
        .select(`
          id,
          family_user_id,
          session_date,
          messages_sent,
          max_daily_messages,
          is_premium
        `)
        .eq('caregiver_id', user.id.toString())
        .order('session_date', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching chat sessions:', sessionsError);
        return;
      }

      console.log('[ActiveChatSessions] Found sessions:', sessionsData?.length || 0);

      if (!sessionsData || sessionsData.length === 0) {
        console.log('[ActiveChatSessions] No sessions found');
        setSessions([]);
        return;
      }

      // Get family profiles and latest messages for each session
      const enrichedSessions: ActiveSession[] = [];
      
      for (const session of sessionsData) {
        console.log('[ActiveChatSessions] Processing session:', session.id, 'for family:', session.family_user_id);
        
        // Get family profile
        const { data: familyProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', session.family_user_id)
          .single();

        console.log('[ActiveChatSessions] Family profile found:', familyProfile?.full_name || 'None');

        // Get latest message for this session
        const { data: latestMessage } = await supabase
          .from('caregiver_chat_messages')
          .select('content, created_at, is_user, sender')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('[ActiveChatSessions] Latest message:', latestMessage?.content?.substring(0, 50) || 'None');

        // Count unread messages (messages from family that caregiver hasn't seen)
        // Fix: Family messages have is_user: true, not false
        const { count: unreadCount } = await supabase
          .from('caregiver_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .eq('is_user', true) // Changed from false to true - family messages have is_user: true
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

        console.log('[ActiveChatSessions] Unread count for session:', session.id, '=', unreadCount);

        enrichedSessions.push({
          ...session,
          family_profile: familyProfile || undefined,
          last_message: latestMessage || undefined,
          unread_count: unreadCount || 0
        });
      }

      console.log('[ActiveChatSessions] Enriched sessions:', enrichedSessions.length);

      // Filter out sessions with no messages and sort by latest activity
      const activeSessions = enrichedSessions
        .filter(session => session.last_message)
        .sort((a, b) => {
          const aTime = a.last_message?.created_at || '';
          const bTime = b.last_message?.created_at || '';
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

      console.log('[ActiveChatSessions] Active sessions after filtering:', activeSessions.length);
      setSessions(activeSessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      toast.error('Failed to load active chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (session: ActiveSession) => {
    if (session.family_profile) {
      setSelectedFamily({
        id: session.family_profile.id,
        full_name: session.family_profile.full_name,
        avatar_url: session.family_profile.avatar_url
      });
      setChatModalOpen(true);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const truncateMessage = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Active Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return null; // Don't show section if no active sessions
  }

  const totalUnread = sessions.reduce((sum, session) => sum + session.unread_count, 0);

  return (
    <>
      <Card className="mb-8 border-l-4 border-l-green-500" data-section="active-chats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Active Conversations
            {totalUnread > 0 && (
              <Badge className="bg-green-500 text-white">
                {totalUnread} new
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-500">
            Family members who have started conversations with you
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="border rounded-lg p-4 bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-green-200">
                    <AvatarImage 
                      src={session.family_profile?.avatar_url || undefined} 
                      alt={session.family_profile?.full_name || 'Family Member'} 
                    />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {session.family_profile?.full_name?.charAt(0) || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-green-900 truncate">
                        {session.family_profile?.full_name || 'Family Member'}
                      </h4>
                      {session.unread_count > 0 && (
                        <Badge variant="secondary" className="bg-green-200 text-green-800">
                          {session.unread_count} new
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {session.last_message && formatTimeAgo(session.last_message.created_at)}
                      </div>
                    </div>
                    
                    {session.last_message && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                          <span className="font-medium text-gray-500">
                            {session.last_message.is_user ? 'You' : session.family_profile?.full_name}:
                          </span>{' '}
                          {truncateMessage(session.last_message.content)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        <span>{session.messages_sent} of {session.max_daily_messages} daily messages</span>
                        {session.is_premium && (
                          <Badge variant="outline" className="text-xs">Premium</Badge>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleReplyClick(session)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Modal */}
      {selectedFamily && (
        <ProfessionalCaregiverChatModal
          open={chatModalOpen}
          onOpenChange={(open) => {
            setChatModalOpen(open);
            if (!open) {
              setSelectedFamily(null);
              // Refresh sessions when modal closes to update unread counts
              fetchActiveSessions();
            }
          }}
          family={selectedFamily}
        />
      )}
    </>
  );
};