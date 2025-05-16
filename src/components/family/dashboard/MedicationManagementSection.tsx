
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Clock, Calendar, PenSquare, ArrowRight } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

interface MedicationManagementSectionProps {
  carePlanId?: string;
}

export const MedicationManagementSection: React.FC<MedicationManagementSectionProps> = ({ carePlanId }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Medication Management</CardTitle>
        <CardDescription>Track and manage medications, schedules, and administration</CardDescription>
      </CardHeader>
      <CardContent>
        {carePlanId ? (
          <Link to={`/family/care-management/${carePlanId}`}>
            <Button variant="default" className="w-full mb-6">
              Manage Medications
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/family/features-overview">
              <Button variant="default" className="w-full mb-6">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <UpvoteFeatureButton featureTitle="Medication Management" className="w-full mb-6" buttonText="Upvote this Feature" />
          </>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Medications
              </CardTitle>
              <CardDescription>View and manage medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carePlanId ? (
                <Link to={`/family/care-management/${carePlanId}?tab=medications`}>
                  <Button variant="secondary" className="w-full">View Medications</Button>
                </Link>
              ) : (
                <Link to="/family/features-overview">
                  <Button variant="secondary" className="w-full">View Medications</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Schedule
              </CardTitle>
              <CardDescription>Manage medication schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carePlanId ? (
                <Link to={`/family/care-management/${carePlanId}?tab=medications`}>
                  <Button variant="secondary" className="w-full">View Schedule</Button>
                </Link>
              ) : (
                <Link to="/family/features-overview">
                  <Button variant="secondary" className="w-full">View Schedule</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Planning
              </CardTitle>
              <CardDescription>Plan medication routines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carePlanId ? (
                <Link to={`/family/care-management/${carePlanId}?tab=medications`}>
                  <Button variant="secondary" className="w-full">View Planning</Button>
                </Link>
              ) : (
                <Link to="/family/features-overview">
                  <Button variant="secondary" className="w-full">View Planning</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenSquare className="h-5 w-5 text-primary" />
                Administration
              </CardTitle>
              <CardDescription>Track medication administration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carePlanId ? (
                <Link to={`/family/care-management/${carePlanId}?tab=medications`}>
                  <Button variant="secondary" className="w-full">View Administration</Button>
                </Link>
              ) : (
                <Link to="/family/features-overview">
                  <Button variant="secondary" className="w-full">View Administration</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
