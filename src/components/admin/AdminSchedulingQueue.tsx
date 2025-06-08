
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Video, Home, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { ScheduleVisitDialog } from './ScheduleVisitDialog';

interface PendingSchedulingRequest {
  id: string;
  full_name: string;
  preferred_visit_type: 'virtual' | 'in_person';
  admin_scheduling_requested_at: string;
  visit_scheduling_status: string;
  phone_number?: string;
}

interface AdminSchedulingQueueProps {
  onRequestScheduled: () => void;
}

export const AdminSchedulingQueue: React.FC<AdminSchedulingQueueProps> = ({ onRequestScheduled }) => {
  const [pendingRequests, setPendingRequests] = useState<PendingSchedulingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingSchedulingRequest | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending scheduling requests...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, preferred_visit_type, admin_scheduling_requested_at, visit_scheduling_status, phone_number')
        .eq('ready_for_admin_scheduling', true)
        .eq('visit_scheduling_status', 'ready_to_schedule')
        .order('admin_scheduling_requested_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending requests:', error);
        throw error;
      }

      console.log('Pending requests fetched:', data?.length || 0);
      setPendingRequests(data || []);
    } catch (error: any) {
      console.error('Error in fetchPendingRequests:', error);
      toast.error(`Failed to load pending requests: ${error.message}`);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleVisit = (user: PendingSchedulingRequest) => {
    setSelectedUser(user);
    setShowScheduleDialog(true);
  };

  const handleVisitScheduled = async () => {
    await fetchPendingRequests(); // Refresh the list
    onRequestScheduled(); // Notify parent component
    setShowScheduleDialog(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const getVisitTypeIcon = (type: 'virtual' | 'in_person') => {
    return type === 'virtual' ? <Video className="h-4 w-4" /> : <Home className="h-4 w-4" />;
  };

  const getVisitTypeBadge = (type: 'virtual' | 'in_person') => {
    return type === 'virtual' 
      ? <Badge variant="secondary" className="flex items-center gap-1"><Video className="h-3 w-3" />Virtual</Badge>
      : <Badge variant="outline" className="flex items-center gap-1"><Home className="h-3 w-3" />In-Person</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Virtual Requests</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {pendingRequests.filter(r => r.preferred_visit_type === 'virtual').length}
                  </p>
                </div>
                <Video className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In-Person Requests</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pendingRequests.filter(r => r.preferred_visit_type === 'in_person').length}
                  </p>
                </div>
                <Home className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Scheduling Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No pending scheduling requests</p>
                <p className="text-sm mt-2">All scheduling requests have been processed.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Family</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Visit Type</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{request.full_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.phone_number ? (
                              <div>📞 {request.phone_number}</div>
                            ) : (
                              <div className="text-gray-400">No phone provided</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getVisitTypeBadge(request.preferred_visit_type)}
                          {request.preferred_visit_type === 'in_person' && (
                            <div className="text-xs text-green-600 mt-1">$300 TTD</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.admin_scheduling_requested_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.admin_scheduling_requested_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleScheduleVisit(request)}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Schedule Visit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Visit Dialog */}
      {selectedUser && (
        <ScheduleVisitDialog
          onVisitScheduled={handleVisitScheduled}
          preselectedUser={{
            id: selectedUser.id,
            full_name: selectedUser.full_name,
            email: '', // Empty since we don't have email
            preferred_visit_type: selectedUser.preferred_visit_type
          }}
        />
      )}
    </>
  );
};
