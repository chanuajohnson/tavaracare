
import React, { useState } from 'react';
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarePlansList } from "@/components/professional/CarePlansList";
import { ProfessionalCalendar } from "@/components/professional/ProfessionalCalendar";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { useAuth } from "@/components/providers/AuthProvider";

const ProfessionalProfileHub = () => {
  const [activeTab, setActiveTab] = useState("care-plans");
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="professional_profile_hub_view" 
        additionalData={{ user_id: user?.id }} 
      />
      
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Professional Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your care plans, schedule, and payment information.
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="care-plans">My Care Plans</TabsTrigger>
            <TabsTrigger value="schedule">My Schedule</TabsTrigger>
            <TabsTrigger value="payroll">My Hours & Pay</TabsTrigger>
          </TabsList>
          
          <TabsContent value="care-plans">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>My Assigned Care Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  These are the care plans you are currently assigned to.
                </p>
                <CarePlansList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>My Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  View and manage your upcoming shifts across all care plans.
                </p>
                <ProfessionalCalendar />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>My Hours & Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  View your work hours and payment information.
                </p>
                <div className="text-center py-12">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-muted-foreground">
                    Consolidated payroll information across all care plans will be available here soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default ProfessionalProfileHub;
