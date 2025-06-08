
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Calendar, TrendingUp, BarChart } from "lucide-react";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { FeedbackManagement } from "@/components/admin/FeedbackManagement";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleVisitScheduleClick = () => {
    navigate('/admin/visit-schedule');
  };

  const handleFeedbackClick = () => {
    navigate('/admin/feedback');
  };

  const handleJourneyClick = () => {
    navigate('/admin/user-journey');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={handleVisitScheduleClick}
          className="h-20 flex flex-col items-center justify-center gap-2"
          variant="outline"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm font-medium">Visit Schedule Management</span>
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

      {/* Main Content */}
      <div className="grid gap-8">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUserManagement />
          </CardContent>
        </Card>

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
