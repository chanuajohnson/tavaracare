import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Clock, Check, X, User, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ProfessionalCaregiverChatModal } from "@/components/professional/ProfessionalCaregiverChatModal";
import { useNavigate } from "react-router-dom";

interface ChatRequest {
  id: string;
  family_user_id: string;
  initial_message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  accepted_at?: string;
  declined_at?: string;
  family_profile?: {
    full_name: string;
    avatar_url: string | null;
    location: string | null;
  };
}

interface ActiveSession {
  id: string;
  family_user_id: string;
  family_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_premium: boolean;
}

export const ChatRequestsSection = () => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [authDebugInfo, setAuthDebugInfo] = useState<any>(null);
  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [activeFamily, setActiveFamily] = useState<{ id: string; full_name: string; avatar_url?: string | null } | null>(null);

  // ENHANCED: Debug auth state for troubleshooting
  useEffect(() => {
    if (user) {
      setAuthDebugInfo({
        userId: user.id,
        userEmail: user.email,
        userRole: userRole,
        metadataRole: user.user_metadata?.role,
        isLoading: authLoading
      });
      console.log('[ChatRequestsSection] Auth Debug Info:', {
        userId: user.id,
        userEmail: user.email,
        userRole: userRole,
        metadataRole: user.user_metadata?.role,
        isLoading: authLoading
      });
    }
  }, [user, userRole, authLoading]);

  const loadChatRequests = async (showLoadingSpinner = true) => {
    // ENHANCED: Wait for auth to be fully loaded
    if (authLoading || !user?.id) {
      console.log('[ChatRequestsSection] Auth still loading or no user ID, skipping load');
      if (!authLoading) {
        setIsLoading(false); // Stop loading if auth is done but no user
      }
      return;
    }

    try {
      if (showLoadingSpinner) {
        setIsLoading(true);
      }
      
      console.log(`[ChatRequestsSection] *** ENHANCED LOADING ***`);
      console.log(`[ChatRequestsSection] Loading chat requests for caregiver: ${user.id}`);
      console.log(`[ChatRequestsSection] User role: ${userRole || user.user_metadata?.role}`);
      console.log(`[ChatRequestsSection] User email: ${user.email}`);
      
      // Load both chat requests and active sessions in parallel
      const [chatRequestsResult, sessionsResult] = await Promise.all([
        // Query chat requests
        supabase
          .from('caregiver_chat_requests')
          .select('*')
          .eq('caregiver_id', user.id)
          .order('created_at', { ascending: false }),
        
        // Query active chat sessions - FIXED: Check both user ID and email
        supabase
          .from('caregiver_chat_sessions')
          .select(`
            id,
            family_user_id,
            is_premium,
            created_at,
            updated_at,
            session_date
          `)
          .eq('caregiver_id', user.id)
          .order('updated_at', { ascending: false })
      ]);

      if (chatRequestsResult.error) {
        console.error('[ChatRequestsSection] Error loading chat requests:', chatRequestsResult.error);
        toast.error('Failed to load chat requests');
        return;
      }

      if (sessionsResult.error) {
        console.error('[ChatRequestsSection] Error loading chat sessions:', sessionsResult.error);
      }

      const chatRequests = chatRequestsResult.data || [];
      const sessions = sessionsResult.data || [];

      console.log(`[ChatRequestsSection] Found ${chatRequests.length} chat requests and ${sessions.length} sessions`);

      // Get all unique family user IDs
      const allFamilyIds = [...new Set([
        ...chatRequests.map(req => req.family_user_id),
        ...sessions.map(session => session.family_user_id)
      ])];

      let profiles: any[] = [];
      if (allFamilyIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, location')
          .in('id', allFamilyIds);

        if (profileError) {
          console.warn('[ChatRequestsSection] Error loading family profiles:', profileError);
        } else {
          profiles = profileData || [];
          console.log(`[ChatRequestsSection] Loaded ${profiles.length} family profiles`);
        }
      }

      // Transform chat requests
      const transformedRequests: ChatRequest[] = chatRequests.map(request => {
        const profile = profiles.find(p => p.id === request.family_user_id);
        return {
          id: request.id,
          family_user_id: request.family_user_id,
          initial_message: request.initial_message,
          status: request.status as 'pending' | 'accepted' | 'declined',
          created_at: request.created_at,
          family_profile: profile ? {
            full_name: profile.full_name || 'Family Member',
            avatar_url: profile.avatar_url,
            location: profile.location
          } : undefined
        };
      });

      // Process active sessions
      const activeSessions: ActiveSession[] = [];
      for (const session of sessions) {
        const profile = profiles.find(p => p.id === session.family_user_id);
        if (!profile) continue;

        // Get latest message for this session
        const { data: messages } = await supabase
          .from('caregiver_chat_messages')
          .select('content, created_at, sender')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const latestMessage = messages?.[0];
        
        // Count unread messages (messages from family since last professional message)
        const { count: unreadCount } = await supabase
          .from('caregiver_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .eq('sender', 'family')
          .gte('created_at', session.updated_at);

        activeSessions.push({
          id: session.id,
          family_user_id: session.family_user_id,
          family_profile: {
            id: profile.id,
            full_name: profile.full_name || 'Family Member',
            avatar_url: profile.avatar_url
          },
          last_message: latestMessage?.content || 'No messages yet',
          last_message_at: latestMessage?.created_at || session.created_at,
          unread_count: unreadCount || 0,
          is_premium: session.is_premium || false
        });
      }

      console.log(`[ChatRequestsSection] Processed ${activeSessions.length} active sessions:`, activeSessions);
      
      setRequests(transformedRequests);
      setActiveSessions(activeSessions);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('[ChatRequestsSection] *** ERROR IN LOAD REQUESTS ***');
      console.error('[ChatRequestsSection] Exception details:', error);
      toast.error('Failed to load chat requests');
    } finally {
      if (showLoadingSpinner) {
        setIsLoading(false);
      }
    }
  };

  const handleRequestResponse = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingRequest(requestId);
      
      console.log(`[ChatRequestsSection] *** ${action.toUpperCase()}ING REQUEST ***`);
      console.log(`[ChatRequestsSection] Request ID: ${requestId}`);
      
      const updateData = {
        status: action === 'accept' ? 'accepted' : 'declined',
        [action === 'accept' ? 'accepted_at' : 'declined_at']: new Date().toISOString()
      };

      console.log(`[ChatRequestsSection] Update data:`, updateData);

      const { data, error } = await supabase
        .from('caregiver_chat_requests')
        .update(updateData)
        .eq('id', requestId)
        .select();

      if (error) {
        console.error(`[ChatRequestsSection] Error ${action}ing request:`, error);
        console.error(`[ChatRequestsSection] Error details:`, JSON.stringify(error, null, 2));
        toast.error(`Failed to ${action} request`);
        return;
      }

      console.log(`[ChatRequestsSection] *** ${action.toUpperCase()} SUCCESS ***`);
      console.log(`[ChatRequestsSection] Updated data:`, data);

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
          : req
      ));

      toast.success(
        action === 'accept' 
          ? 'Chat request accepted! Family will be notified.' 
          : 'Chat request declined.'
      );

      console.log(`[ChatRequestsSection] Successfully ${action}ed request`);
    } catch (error) {
      console.error(`[ChatRequestsSection] *** EXCEPTION ${action.toUpperCase()}ING REQUEST ***`);
      console.error(`[ChatRequestsSection] Exception details:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRefresh = () => {
    console.log('[ChatRequestsSection] Manual refresh triggered');
    loadChatRequests(false);
  };

  // Open chat with accepted family request
  const openChatWithFamily = (request: ChatRequest) => {
    const fullName = request.family_profile?.full_name || 'Family Member';
    setActiveFamily({ id: request.family_user_id, full_name: fullName, avatar_url: request.family_profile?.avatar_url ?? null });
    setChatOpen(true);
  };
  // ENHANCED: Effect to load requests when auth is ready
  useEffect(() => {
    console.log('[ChatRequestsSection] *** AUTH STATE CHANGE ***', {
      hasUser: !!user,
      userId: user?.id,
      userRole: userRole || user?.user_metadata?.role,
      authLoading,
      isExpectedRole: (userRole === 'professional' || user?.user_metadata?.role === 'professional')
    });

    // Wait for auth to be fully loaded and user to have professional role
    if (!authLoading && user?.id && (userRole === 'professional' || user?.user_metadata?.role === 'professional')) {
      console.log('[ChatRequestsSection] *** COMPONENT MOUNTED WITH VALID PROFESSIONAL USER ***');
      console.log('[ChatRequestsSection] User:', { id: user.id, role: userRole || user.user_metadata?.role });
      
      loadChatRequests();
      
      // Set up real-time subscription for new requests
      console.log('[ChatRequestsSection] Setting up real-time subscription...');
      const channel = supabase
        .channel('chat-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'caregiver_chat_requests',
            filter: `caregiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[ChatRequestsSection] *** NEW CHAT REQUEST VIA REALTIME ***', payload);
            loadChatRequests(false); // Reload without spinner
            toast.success('New chat request received!');
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'caregiver_chat_requests',
            filter: `caregiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[ChatRequestsSection] *** CHAT REQUEST UPDATED VIA REALTIME ***', payload);
            loadChatRequests(false);
          }
        )
        .subscribe((status) => {
          console.log('[ChatRequestsSection] Real-time subscription status:', status);
        });

      return () => {
        console.log('[ChatRequestsSection] Cleaning up real-time subscription');
        supabase.removeChannel(channel);
      };
    } else if (!authLoading && user?.id) {
      // User exists but doesn't have professional role
      console.log('[ChatRequestsSection] User exists but role mismatch:', {
        userRole,
        metadataRole: user.user_metadata?.role,
        expected: 'professional'
      });
      setIsLoading(false);
    } else if (!authLoading) {
      // Auth loaded but no user
      console.log('[ChatRequestsSection] Auth loaded but no user found');
      setIsLoading(false);
    }
  }, [user?.id, userRole, authLoading, user?.user_metadata?.role]);

  // Don't render anything if user doesn't have professional role
  const isProfessional = userRole === 'professional' || user?.user_metadata?.role === 'professional';
  if (!authLoading && (!user || !isProfessional)) {
    console.log('[ChatRequestsSection] Not rendering - user role check failed:', {
      hasUser: !!user,
      userRole,
      metadataRole: user?.user_metadata?.role,
      isProfessional
    });
    return null;
  }

  // Show component if there are requests OR active sessions
  const hasContent = requests.length > 0 || activeSessions.length > 0;
  if (!isLoading && !authLoading && !hasContent) {
    console.log('[ChatRequestsSection] No requests or active sessions found - not rendering component');
    return null;
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const respondedRequests = requests.filter(req => req.status !== 'pending');

  console.log(`[ChatRequestsSection] *** RENDER STATE ***`, {
    totalRequests: requests.length,
    pendingRequests: pendingRequests.length,
    respondedRequests: respondedRequests.length,
    activeSessions: activeSessions.length,
    isLoading,
    authLoading,
    userId: user?.id,
    userRole: userRole || user?.user_metadata?.role
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <CardTitle>
              {pendingRequests.length > 0 ? 'Chat Requests' : 'Messages & Requests'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {pendingRequests.length} pending
              </Badge>
            )}
            {activeSessions.length > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {activeSessions.length} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || authLoading}
            >
              <RefreshCw className={`h-4 w-4 ${(isLoading || authLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
        {/* ENHANCED: Show auth debug info in development */}
        {window.location.hostname.includes('lovable.app') && authDebugInfo && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            Debug: {authDebugInfo.userEmail} • Role: {authDebugInfo.userRole || authDebugInfo.metadataRole || 'None'} • ID: {authDebugInfo.userId?.slice(0, 8)}...
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {(isLoading || authLoading) ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              {authLoading ? 'Loading authentication...' : 'Loading chat requests...'}
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {pendingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border border-blue-200 rounded-lg p-4 bg-blue-50"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.family_profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {request.family_profile?.full_name || 'Family Member'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {request.family_profile?.location && (
                              <p className="text-sm text-gray-600 mb-2">
                                📍 {request.family_profile.location}
                              </p>
                            )}
                            
                            <p className="text-sm text-gray-700 mb-3 bg-white p-2 rounded border">
                              "{request.initial_message}"
                            </p>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRequestResponse(request.id, 'accept')}
                                disabled={processingRequest === request.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRequestResponse(request.id, 'decline')}
                                disabled={processingRequest === request.id}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Active Conversations */}
            {activeSessions.length > 0 && (
              <div className={pendingRequests.length > 0 ? "pt-4 border-t" : ""}>
                <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Active Conversations ({activeSessions.length})
                </h3>
                <div className="space-y-2">
                  {activeSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.family_profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {session.family_profile.full_name}
                            </span>
                            {session.unread_count > 0 && (
                              <Badge variant="default" className="bg-blue-600 text-white text-xs h-5">
                                {session.unread_count}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 truncate mb-2">
                            {session.last_message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(session.last_message_at).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setActiveFamily({
                                    id: session.family_user_id,
                                    full_name: session.family_profile.full_name,
                                    avatar_url: session.family_profile.avatar_url
                                  });
                                  setChatOpen(true);
                                }}
                                className="text-xs h-7"
                              >
                                Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate('/professional/message-board')}
                                className="text-xs h-7"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activeSessions.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/professional/message-board')}
                      className="w-full text-sm text-blue-600 hover:text-blue-700"
                    >
                      View All Messages ({activeSessions.length}) →
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Recent Responses - Only show recent ones (last 7 days) */}
            {respondedRequests.filter(req => {
              const responseDate = new Date(req.accepted_at || req.declined_at || req.created_at);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return responseDate >= sevenDaysAgo;
            }).length > 0 && (
              <div className={pendingRequests.length > 0 ? "pt-4 border-t" : ""}>
                <h3 className="font-medium text-sm text-gray-700 mb-3">
                  Recent Responses ({respondedRequests.filter(req => {
                    const responseDate = new Date(req.accepted_at || req.declined_at || req.created_at);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return responseDate >= sevenDaysAgo;
                  }).length})
                </h3>
                <div className="space-y-2">
                  {respondedRequests.filter(req => {
                    const responseDate = new Date(req.accepted_at || req.declined_at || req.created_at);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return responseDate >= sevenDaysAgo;
                  }).slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.family_profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {request.family_profile?.full_name || 'Family Member'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={request.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                        >
                          {request.status}
                        </Badge>
                        {request.status === 'accepted' && (
                          <Button size="sm" variant="secondary" onClick={() => openChatWithFamily(request)}>
                            Open Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {activeFamily && (
          <ProfessionalCaregiverChatModal
            open={chatOpen}
            onOpenChange={(o) => {
              setChatOpen(o);
              if (!o) setActiveFamily(null);
            }}
            family={activeFamily}
          />
        )}
      </CardContent>
    </Card>
  );
};
