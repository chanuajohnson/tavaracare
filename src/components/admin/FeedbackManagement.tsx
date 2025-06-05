
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Filter, 
  Search, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
  Reply
} from 'lucide-react';
import { format } from 'date-fns';

interface FeedbackItem {
  id: string;
  feedback_type: string;
  category: string;
  subject: string;
  message: string;
  rating: number;
  contact_info: any;
  metadata: any;
  status: string;
  priority: string;
  created_at: string;
  user_id: string;
  admin_response?: string;
  responded_at?: string;
}

const FEEDBACK_TYPES = {
  general: { label: 'General Feedback', icon: '💬', color: 'bg-blue-100 text-blue-800' },
  technical: { label: 'Technical Issues', icon: '🔧', color: 'bg-red-100 text-red-800' },
  excitement: { label: 'Excitement & Testimonials', icon: '🎉', color: 'bg-green-100 text-green-800' },
  investor: { label: 'Investment & Partnership', icon: '💼', color: 'bg-purple-100 text-purple-800' },
  referral: { label: 'Referrals', icon: '🤝', color: 'bg-orange-100 text-orange-800' },
  agency: { label: 'Agency & Professional Services', icon: '🏢', color: 'bg-indigo-100 text-indigo-800' },
  coffee: { label: 'Buy Us Coffee', icon: '☕', color: 'bg-yellow-100 text-yellow-800' },
  bug_report: { label: 'Bug Report', icon: '🐛', color: 'bg-red-100 text-red-800' },
  feature_request: { label: 'Feature Request', icon: '✨', color: 'bg-cyan-100 text-cyan-800' },
  testimonial: { label: 'Testimonial', icon: '⭐', color: 'bg-green-100 text-green-800' },
  partnership: { label: 'Partnership Opportunity', icon: '🤝', color: 'bg-purple-100 text-purple-800' }
};

const STATUS_OPTIONS = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  reviewed: { label: 'Reviewed', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  responded: { label: 'Responded', color: 'bg-green-100 text-green-800', icon: Reply },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
};

const PRIORITY_OPTIONS = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

export const FeedbackManagement: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [analytics, setAnalytics] = useState({
    total: 0,
    new: 0,
    avgRating: 0,
    responseRate: 0
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
    calculateAnalytics();
  }, [feedback, searchQuery, statusFilter, typeFilter, priorityFilter]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = feedback;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.feedback_type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    setFilteredFeedback(filtered);
  };

  const calculateAnalytics = () => {
    const total = feedback.length;
    const newCount = feedback.filter(item => item.status === 'new').length;
    const ratingsSum = feedback.filter(item => item.rating).reduce((sum, item) => sum + item.rating, 0);
    const ratingsCount = feedback.filter(item => item.rating).length;
    const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    const respondedCount = feedback.filter(item => item.status === 'responded' || item.status === 'closed').length;
    const responseRate = total > 0 ? (respondedCount / total) * 100 : 0;

    setAnalytics({
      total,
      new: newCount,
      avgRating,
      responseRate
    });
  };

  const updateFeedbackStatus = async (id: string, status: string, priority?: string) => {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .update({ 
          status, 
          ...(priority && { priority }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setFeedback(prev => prev.map(item => 
        item.id === id ? { ...item, status, ...(priority && { priority }) } : item
      ));

      toast.success('Feedback updated successfully');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    }
  };

  const submitResponse = async () => {
    if (!selectedFeedback || !adminResponse.trim()) return;

    setIsResponding(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .update({
          admin_response: adminResponse,
          responded_at: new Date().toISOString(),
          status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);

      if (error) throw error;

      // Update local state
      setFeedback(prev => prev.map(item => 
        item.id === selectedFeedback.id 
          ? { ...item, admin_response: adminResponse, responded_at: new Date().toISOString(), status: 'responded' }
          : item
      ));

      setAdminResponse('');
      setSelectedFeedback(null);
      toast.success('Response submitted successfully');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setIsResponding(false);
    }
  };

  const FeedbackCard = ({ item }: { item: FeedbackItem }) => {
    const feedbackType = FEEDBACK_TYPES[item.feedback_type as keyof typeof FEEDBACK_TYPES];
    const status = STATUS_OPTIONS[item.status as keyof typeof STATUS_OPTIONS];
    const priority = PRIORITY_OPTIONS[item.priority as keyof typeof PRIORITY_OPTIONS];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-lg">{feedbackType?.icon}</span>
              <div>
                <CardTitle className="text-sm font-medium">{item.subject}</CardTitle>
                <CardDescription className="text-xs">
                  {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge className={`text-xs ${priority?.color}`}>
                {priority?.label}
              </Badge>
              <Badge className={`text-xs ${status?.color}`}>
                {status?.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Badge className={`text-xs ${feedbackType?.color}`}>
              {feedbackType?.label}
            </Badge>
            {item.category && (
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            )}
            {item.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-500">({item.rating}/5)</span>
              </div>
            )}
            <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-1">
                <Select value={item.status} onValueChange={(value) => updateFeedbackStatus(item.id, value)}>
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_OPTIONS).map(([key, option]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={item.priority} onValueChange={(value) => updateFeedbackStatus(item.id, item.status, value)}>
                  <SelectTrigger className="w-20 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_OPTIONS).map(([key, option]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span>{feedbackType?.icon}</span>
                      {item.subject}
                    </DialogTitle>
                    <DialogDescription>
                      {feedbackType?.label} • {format(new Date(item.created_at), 'MMMM dd, yyyy HH:mm')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge className={feedbackType?.color}>
                        {feedbackType?.label}
                      </Badge>
                      {item.category && (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                      <Badge className={status?.color}>
                        {status?.label}
                      </Badge>
                      <Badge className={priority?.color}>
                        {priority?.label}
                      </Badge>
                    </div>
                    
                    {item.rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rating:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm">({item.rating}/5)</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-sm font-medium">Message:</Label>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                        {item.message}
                      </p>
                    </div>
                    
                    {item.contact_info && Object.keys(item.contact_info).length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Contact Information:</Label>
                        <div className="mt-1 text-sm bg-gray-50 p-3 rounded-md">
                          {item.contact_info.name && <p><strong>Name:</strong> {item.contact_info.name}</p>}
                          {item.contact_info.email && <p><strong>Email:</strong> {item.contact_info.email}</p>}
                          {item.contact_info.phone && <p><strong>Phone:</strong> {item.contact_info.phone}</p>}
                        </div>
                      </div>
                    )}
                    
                    {item.admin_response && (
                      <div>
                        <Label className="text-sm font-medium">Admin Response:</Label>
                        <p className="mt-1 text-sm bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                          {item.admin_response}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Responded on {format(new Date(item.responded_at!), 'MMMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                    
                    {!item.admin_response && (
                      <div>
                        <Label className="text-sm font-medium">Add Response:</Label>
                        <Textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Type your response here..."
                          className="mt-1"
                          rows={4}
                        />
                        <Button
                          onClick={submitResponse}
                          disabled={isResponding || !adminResponse.trim()}
                          className="mt-2"
                          size="sm"
                        >
                          {isResponding ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Reply className="h-4 w-4 mr-2" />
                              Send Response
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{analytics.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Feedback</p>
                <p className="text-2xl font-bold">{analytics.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{analytics.avgRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">{analytics.responseRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_OPTIONS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(FEEDBACK_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(PRIORITY_OPTIONS).map(([key, option]) => (
                  <SelectItem key={key} value={key}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeedback.map((item) => (
          <FeedbackCard key={item.id} item={item} />
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No feedback found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
