
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Calendar, Bell, ArrowRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

export const CareManagementSection = () => {
  return (
    <div className="space-y-6 mb-8">
      <Card className="mb-2">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Care Management</CardTitle>
          <CardDescription>Manage care plans, team members, appointments and more</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/family/features-overview">
            <Button variant="default" className="w-full mb-6">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <UpvoteFeatureButton featureTitle="Care Management" className="w-full mb-6" buttonText="Upvote this Feature" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  New Care Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management">
                  <Button variant="secondary" className="w-full">Create Plan</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management">
                  <Button variant="secondary" className="w-full">Add Member</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Schedule Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management">
                  <Button variant="secondary" className="w-full">Schedule</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management">
                  <Button variant="secondary" className="w-full">View</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Care Plans
                </CardTitle>
                <CardDescription>View and manage care plans</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management">
                  <Button variant="secondary" className="w-full">View Plans</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Care Team
                </CardTitle>
                <CardDescription>Manage your care team members</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management/team">
                  <Button variant="secondary" className="w-full">View Team</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Appointments
                </CardTitle>
                <CardDescription>Schedule and manage appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/family/care-management/schedule">
                  <Button variant="secondary" className="w-full">View Calendar</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
