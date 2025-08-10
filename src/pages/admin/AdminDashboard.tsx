
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageSquare, Users, Calendar, TrendingUp, BarChart, Clock, Video, MessageCircle, Settings, UserCheck } from "lucide-react";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { FeedbackManagement } from "@/components/admin/FeedbackManagement";
import { UnifiedMatchingInterface } from "@/components/admin/UnifiedMatchingInterface";
import { MatchRecalculationLog } from '@/components/admin/MatchRecalculationLog';
import { supabase } from '@/integrations/supabase/client';
import { backfillAvailableCaregiverMatches } from '@/utils/admin/manualMatchRecalculation';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingSchedulingCount, setPendingSchedulingCount] = useState(0);
  const [showMatchingInterface, setShowMatchingInterface] = useState(false);
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0);

  const fetchPendingSchedulingCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('ready_for_admin_scheduling', true)
        .eq('visit_scheduling_status', 'ready_to_schedule');

      if (error) throw error;
      setPendingSchedulingCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending scheduling count:', error);
    }
  };

  const fetchPendingMatchesCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'family')
        .is('manual_match_assigned', false);

      if (error) throw error;
      setPendingMatchesCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending matches count:', error);
    }
  };

  useEffect(() => {
    fetchPendingSchedulingCount();
    fetchPendingMatchesCount();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      fetchPendingSchedulingCount();
      fetchPendingMatchesCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleHeroVideoClick = () => {
    navigate('/admin/hero-video-management');
  };

  const handleVisitScheduleClick = () => {
    // Navigate directly to the queue tab if there are pending requests
    if (pendingSchedulingCount > 0) {
      navigate('/admin/visit-schedule#queue');
    } else {
      navigate('/admin/visit-schedule');
    }
  };

  const handleFeedbackClick = () => {
    navigate('/admin/feedback');
  };

  const handleJourneyClick = () => {
    navigate('/admin/user-journey');
  };

  const handleWhatsAppNudgeClick = () => {
    navigate('/admin/whatsapp-nudge');
  };

  const handlePlatformAnalyticsClick = () => {
    navigate('/admin/platform-analytics');
  };

  const handleShiftManagementClick = () => {
    navigate('/admin/shift-management');
  };

  const handleMatchingClick = () => {
    setShowMatchingInterface(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, monitor engagement, and track platform health.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        <Button
          onClick={handleMatchingClick}
          className="h-20 flex flex-col items-center justify-center gap-2 relative"
          variant="outline"
        >
          <UserCheck className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">Caregiver Matching</span>
          {pendingMatchesCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {pendingMatchesCount}
            </div>
          )}
        </Button>
        <Button
          onClick={handleHeroVideoClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <Video className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">Hero Video Management</span>
        </Button>

        <Button
          onClick={handleVisitScheduleClick}
          className="h-20 flex flex-col items-center justify-center gap-2 relative"
          variant="outline"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">Visit Schedule Management</span>
          {pendingSchedulingCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {pendingSchedulingCount}
            </div>
          )}
        </Button>

        <Button
          onClick={handleShiftManagementClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <Settings className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">Shift Configuration Management</span>
        </Button>

        <Button
          onClick={handleWhatsAppNudgeClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">WhatsApp Nudge System</span>
        </Button>
        
        <Button
          onClick={handleFeedbackClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">TAVARA Feedback</span>
        </Button>
        
        <Button
          onClick={handleJourneyClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <TrendingUp className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">User Journey Analytics</span>
        </Button>
        
        <Button
          onClick={handlePlatformAnalyticsClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <BarChart className="h-6 w-6" />
          <span className="text-sm font-medium text-center leading-tight">Platform Analytics</span>
        </Button>
      </div>

      {/* Pending Scheduling Requests Alert */}
      {pendingSchedulingCount > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-800">
                  {pendingSchedulingCount} families waiting for visit scheduling
                </p>
                <p className="text-sm text-orange-600">
                  Click "Visit Schedule Management" to review and schedule visits.
                </p>
              </div>
              <Button 
                onClick={handleVisitScheduleClick}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Review Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-8">
        {/* User Management */}
        <AdminUserManagement />

        {/* Feature Interest Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Interest Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureInterestTracker />
          </CardContent>
        </Card>

        {/* Feedback Management */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackManagement />
          </CardContent>
        </Card>

        {/* Match Recalculation Log */}
        <MatchRecalculationLog />
      </div>

      {/* Unified Matching Interface Modal */}
      <Dialog open={showMatchingInterface} onOpenChange={setShowMatchingInterface}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <UnifiedMatchingInterface
            onClose={() => setShowMatchingInterface(false)}
            onMatchAssigned={() => {
              setShowMatchingInterface(false);
              fetchPendingMatchesCount();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
