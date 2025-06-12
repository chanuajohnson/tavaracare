
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Calendar, TrendingUp, BarChart, Clock, Video } from "lucide-react";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { FeedbackManagement } from "@/components/admin/FeedbackManagement";
import { AdminProfileHeaderSection } from "@/components/admin/AdminProfileHeaderSection";
import { supabase } from '@/integrations/supabase/client';
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingSchedulingCount, setPendingSchedulingCount] = useState(0);

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

  useEffect(() => {
    fetchPendingSchedulingCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingSchedulingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleHeroVideoManagementClick = () => {
    navigate('/admin/hero-videos');
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Profile Header */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AdminProfileHeaderSection />
        </motion.div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, monitor engagement, and track platform health.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Button
          onClick={handleHeroVideoManagementClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <Video className="h-6 w-6" />
          <span className="text-sm font-medium">Hero Video Management</span>
        </Button>

        <Button
          onClick={handleVisitScheduleClick}
          className="h-20 flex flex-col items-center justify-center gap-2 relative"
          variant="outline"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm font-medium">Visit Schedule Management</span>
          {pendingSchedulingCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {pendingSchedulingCount}
            </div>
          )}
        </Button>
        
        <Button
          onClick={handleFeedbackClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm font-medium">TAVARA Feedback</span>
        </Button>
        
        <Button
          onClick={handleJourneyClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <TrendingUp className="h-6 w-6" />
          <span className="text-sm font-medium">User Journey Analytics</span>
        </Button>
        
        <Button
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
          disabled
        >
          <BarChart className="h-6 w-6" />
          <span className="text-sm font-medium">Platform Analytics</span>
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
      </div>
    </div>
  );
}
