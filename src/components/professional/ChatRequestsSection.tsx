
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Clock, Check, X, User, RefreshCw } from "lucide-react";
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
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadChatRequests = async (showLoadingSpinner = true) => {
    if (!user) {
      console.log('[ChatRequestsSection] No user found, skipping load');
      return;
    }

    try {
      if (showLoadingSpinner) {
        setIsLoading(true);
      }
      
      console.log(`[ChatRequestsSection] Loading chat requests for caregiver: ${user.id}`);
      
      // First get the chat requests
      const { data: chatRequests, error: chatError } = await supabase
        .from('caregiver_chat_requests')
        .select('*')
        .eq('caregiver_id', user.id)
        .order('created_at', { ascending: false });

      if (chatError) {
        console.error('[ChatRequestsSection] Error loading chat requests:', chatError);
        toast.error('Failed to load chat requests');
        return;
      }

      console.log(`[ChatRequestsSection] Found ${chatRequests?.length || 0} chat requests:`, chatRequests);

      if (!chatRequests || chatRequests.length === 0) {
        console.log('[ChatRequestsSection] No chat requests found');
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

      console.log(`[ChatRequestsSection] Transformed ${transformedRequests.length} requests:`, transformedRequests);
      setRequests(transformedRequests);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('[ChatRequestsSection] Error in loadChatRequests:', error);
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
      
      console.log(`[ChatRequestsSection] ${action}ing request: ${requestId}`);
      
      const updateData = {
        status: action === 'accept' ? 'accepted' : 'declined',
        [action === 'accept' ? 'accepted_at' : 'declined_at']: new Date().toISOString()
      };

      const { error } = await supabase
        .from('caregiver_chat_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error(`[ChatRequestsSection] Error ${action}ing request:`, error);
        toast.error(`Failed to ${action} request`);
        return;
      }

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
      console.error(`[ChatRequestsSection] Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRefresh = () => {
    console.log('[ChatRequestsSection] Manual refresh triggered');
    loadChatRequests(false);
  };

  useEffect(() => {
    if (user?.role === 'professional') {
      console.log('[ChatRequestsSection] Component mounted, loading chat requests');
      loadChatRequests();
      
      // Set up real-time subscription for new requests
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
            console.log('[ChatRequestsSection] New chat request received via realtime:', payload);
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
            console.log('[ChatRequestsSection] Chat request updated via realtime:', payload);
            loadChatRequests(false);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (user?.role !== 'professional') {
    return null;
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const respondedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <CardTitle>Chat Requests</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {pendingRequests.length} pending
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading chat requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No chat requests yet</p>
            <p className="text-sm">Families will be able to reach out to you here</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Debug Info:</strong> This section shows chat requests from the 
                <code className="bg-blue-100 px-1 rounded mx-1">caregiver_chat_requests</code> table 
                where <code className="bg-blue-100 px-1 rounded mx-1">caregiver_id = {user.id}</code>
              </p>
            </div>
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

            {/* Recent Responses */}
            {respondedRequests.length > 0 && (
              <div className={pendingRequests.length > 0 ? "pt-4 border-t" : ""}>
                <h3 className="font-medium text-sm text-gray-700 mb-3">
                  Recent Responses ({respondedRequests.length})
                </h3>
                <div className="space-y-2">
                  {respondedRequests.slice(0, 3).map((request) => (
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
                      <Badge 
                        className={request.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
