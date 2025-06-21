
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Clock, Check, X, User, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ChatRequest {
  id: string;
  family_user_id: string;
  initial_message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  family_profile?: {
    full_name: string;
    avatar_url: string | null;
    location: string | null;
  };
}

export const ChatRequestsSection = () => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadChatRequests = async (showLoadingSpinner = true) => {
    // Enhanced: Wait for auth to be fully loaded
    if (authLoading || !user?.id) {
      console.log('[ChatRequestsSection] Auth still loading or no user ID, skipping load');
      if (!authLoading) {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (showLoadingSpinner) {
        setIsLoading(true);
      }
      
      console.log(`[ChatRequestsSection] *** ENHANCED LOADING FOR PROFESSIONAL ***`);
      console.log(`[ChatRequestsSection] Loading chat requests for professional: ${user.id}`);
      console.log(`[ChatRequestsSection] User role: ${userRole || user.user_metadata?.role}`);
      
      // FIXED: Query by professional_id matching the logged-in user's ID
      const { data: chatRequests, error: chatError } = await supabase
        .from('family_chat_requests')
        .select('*')
        .eq('professional_id', user.id) // Professional receives requests from families
        .order('created_at', { ascending: false });

      if (chatError) {
        console.error('[ChatRequestsSection] Error loading chat requests:', chatError);
        toast.error('Failed to load chat requests');
        return;
      }

      console.log(`[ChatRequestsSection] *** QUERY RESULTS ***`);
      console.log(`[ChatRequestsSection] Found ${chatRequests?.length || 0} chat requests:`, chatRequests);

      if (!chatRequests || chatRequests.length === 0) {
        console.log('[ChatRequestsSection] No chat requests found for this professional');
        setRequests([]);
        return;
      }

      // Get family profiles for the requests
      const familyUserIds = chatRequests.map(req => req.family_user_id);
      console.log(`[ChatRequestsSection] Loading profiles for family users:`, familyUserIds);
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location')
        .in('id', familyUserIds);

      if (profileError) {
        console.warn('[ChatRequestsSection] Error loading family profiles:', profileError);
      } else {
        console.log(`[ChatRequestsSection] Loaded ${profiles?.length || 0} family profiles:`, profiles);
      }

      // Transform and combine the data
      const transformedRequests: ChatRequest[] = chatRequests.map(request => {
        const profile = profiles?.find(p => p.id === request.family_user_id);
        
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

      console.log(`[ChatRequestsSection] *** TRANSFORMATION COMPLETE ***`);
      console.log(`[ChatRequestsSection] Transformed ${transformedRequests.length} requests:`, transformedRequests);
      setRequests(transformedRequests);
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
        [action === 'accept' ? 'accepted_at' : 'declined_at']: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`[ChatRequestsSection] Update data:`, updateData);

      // ENHANCED: Use transaction approach for better reliability
      const { data, error } = await supabase
        .from('family_chat_requests')
        .update(updateData)
        .eq('id', requestId)
        .select();

      if (error) {
        console.error(`[ChatRequestsSection] Error ${action}ing request:`, error);
        toast.error(`Failed to ${action} request: ${error.message}`);
        return;
      }

      console.log(`[ChatRequestsSection] *** ${action.toUpperCase()} SUCCESS ***`);
      console.log(`[ChatRequestsSection] Updated data:`, data);

      // Update local state immediately for responsive UI
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
          : req
      ));

      // Show success feedback
      toast.success(
        action === 'accept' 
          ? 'Chat request accepted! You can now start a conversation.' 
          : 'Chat request declined.'
      );

      // ENHANCED: If accepted, we could create a chat session here
      if (action === 'accept' && data && data[0]) {
        console.log('[ChatRequestsSection] Creating chat session for accepted request');
        try {
          const { error: sessionError } = await supabase
            .from('family_chat_sessions')
            .insert({
              professional_id: user.id,
              family_user_id: data[0].family_user_id,
              session_date: new Date().toISOString().split('T')[0],
              messages_sent: 0,
              max_daily_messages: 10,
              is_premium: false
            });

          if (sessionError) {
            console.warn('[ChatRequestsSection] Could not create chat session:', sessionError);
          } else {
            console.log('[ChatRequestsSection] Chat session created successfully');
          }
        } catch (sessionErr) {
          console.warn('[ChatRequestsSection] Error creating chat session:', sessionErr);
        }
      }

    } catch (error) {
      console.error(`[ChatRequestsSection] *** ERROR IN ${action.toUpperCase()} REQUEST ***`);
      console.error('[ChatRequestsSection] Exception details:', error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  useEffect(() => {
    loadChatRequests();
  }, [user?.id, authLoading]);

  // ENHANCED: Subscribe to real-time updates for bidirectional sync
  useEffect(() => {
    if (!user?.id) return;

    console.log('[ChatRequestsSection] Setting up real-time subscription for professional:', user.id);

    const channel = supabase
      .channel('family-chat-requests-professional')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_chat_requests',
          filter: `professional_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[ChatRequestsSection] *** REAL-TIME UPDATE ***');
          console.log('[ChatRequestsSection] Payload:', payload);
          
          // Refresh requests when changes occur
          loadChatRequests(false); // Don't show loading spinner for real-time updates
        }
      )
      .subscribe();

    return () => {
      console.log('[ChatRequestsSection] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const recentRequests = requests.filter(req => req.status !== 'pending');

  if (authLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading authentication...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || userRole !== 'professional') {
    return null;
  }

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length} pending
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {requests.length === 0 
              ? "No chat requests yet" 
              : `${pendingRequests.length} pending • ${recentRequests.length} processed`
            }
          </p>
          <p className="text-xs text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadChatRequests()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Requests ({pendingRequests.length})
                </h4>
                <AnimatePresence>
                  {pendingRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 mb-3"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.family_profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">
                              {request.family_profile?.full_name || 'Family Member'}
                            </h5>
                            <Badge variant="secondary">
                              {new Date(request.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                          
                          {request.family_profile?.location && (
                            <p className="text-sm text-gray-600 mb-2">
                              📍 {request.family_profile.location}
                            </p>
                          )}
                          
                          <p className="text-sm text-gray-700 mb-3">
                            "{request.initial_message}"
                          </p>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleRequestResponse(request.id, 'accept')}
                              disabled={processingRequest === request.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processingRequest === request.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestResponse(request.id, 'decline')}
                              disabled={processingRequest === request.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {processingRequest === request.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <X className="h-4 w-4 mr-1" />
                              )}
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Recent Requests */}
            {recentRequests.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">
                  Recent Activity ({recentRequests.length})
                </h4>
                <div className="space-y-2">
                  {recentRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={request.family_profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {request.family_profile?.full_name || 'Family Member'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={request.status === 'accepted' ? 'success' : 'secondary'}
                            className={
                              request.status === 'accepted' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {request.status === 'accepted' && <Check className="h-3 w-3 mr-1" />}
                            {request.status === 'declined' && <X className="h-3 w-3 mr-1" />}
                            {request.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {requests.length === 0 && (
              <div className="text-center py-6">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No chat requests yet</p>
                <p className="text-sm text-gray-400">
                  Chat requests from families will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
