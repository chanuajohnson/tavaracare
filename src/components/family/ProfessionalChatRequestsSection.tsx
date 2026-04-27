
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Check, X, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ProfessionalFamilyChatService, FamilyChatRequest } from '@/services/professionalFamilyChatService';
import { useAuth } from '@/components/providers/AuthProvider';

export const ProfessionalChatRequestsSection = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FamilyChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChatRequests();
    }
  }, [user]);

  const fetchChatRequests = async () => {
    try {
      setLoading(true);
      const chatRequests = await ProfessionalFamilyChatService.getFamilyChatRequests();
      setRequests(chatRequests);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
      toast.error('Failed to load chat requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const result = await ProfessionalFamilyChatService.acceptChatRequest(requestId);
      
      if (result.success) {
        toast.success('Chat request accepted! You can now chat with the professional.');
        fetchChatRequests(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to accept chat request');
      }
    } catch (error) {
      console.error('Error accepting chat request:', error);
      toast.error('Failed to accept chat request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const result = await ProfessionalFamilyChatService.declineChatRequest(requestId);
      
      if (result.success) {
        toast.success('Chat request declined');
        fetchChatRequests(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to decline chat request');
      }
    } catch (error) {
      console.error('Error declining chat request:', error);
      toast.error('Failed to decline chat request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user || loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Professional Chat Requests
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

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const recentRequests = requests.filter(req => req.status !== 'pending').slice(0, 3);

  if (requests.length === 0) {
    return null; // Don't show section if no requests
  }

  return (
    <Card className="mb-8 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Professional Chat Requests
          {pendingRequests.length > 0 && (
            <Badge className="bg-blue-500 text-white">
              {pendingRequests.length}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-500">
          Professionals who are interested in providing care for your family
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3 text-blue-800">New Requests</h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          P
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">Professional Caregiver</h4>
                          {getStatusBadge(request.status)}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3 bg-white p-3 rounded border">
                          {request.initial_message}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={actionLoading === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {actionLoading === request.id ? 'Accepting...' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            disabled={actionLoading === request.id}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            {actionLoading === request.id ? 'Declining...' : 'Decline'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Requests */}
          {recentRequests.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3 text-gray-600">Recent Activity</h3>
              <div className="space-y-2">
                {recentRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                          P
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Professional Caregiver</span>
                          {getStatusBadge(request.status)}
                          <span className="text-xs text-gray-500">
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {request.initial_message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
