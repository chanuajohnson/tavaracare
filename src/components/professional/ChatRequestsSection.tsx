
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Clock, Check, X, User } from "lucide-react";
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

  const loadChatRequests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('caregiver_chat_requests')
        .select(`
          *,
          family_profile:profiles!caregiver_chat_requests_family_user_id_fkey(
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('caregiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading chat requests:', error);
        toast.error('Failed to load chat requests');
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error in loadChatRequests:', error);
      toast.error('Failed to load chat requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResponse = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessingRequest(requestId);
      
      const updateData = {
        status: action === 'accept' ? 'accepted' : 'declined',
        [action === 'accept' ? 'accepted_at' : 'declined_at']: new Date().toISOString()
      };

      const { error } = await supabase
        .from('caregiver_chat_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error(`Error ${action}ing request:`, error);
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
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'professional') {
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
          () => {
            console.log('New chat request received');
            loadChatRequests(); // Reload to get the full data with joins
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
          () => {
            console.log('Chat request updated');
            loadChatRequests();
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
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {pendingRequests.length} pending
            </Badge>
          )}
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
            <p>No chat requests yet</p>
            <p className="text-sm">Families will be able to reach out to you here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Requests
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
                <h3 className="font-medium text-sm text-gray-700 mb-3">Recent Responses</h3>
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
