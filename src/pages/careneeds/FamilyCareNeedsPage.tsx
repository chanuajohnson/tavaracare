
import React, { useEffect } from 'react';
import { FadeIn, SlideIn } from '@/components/framer';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FamilyCareNeedsPage: React.FC = () => {
  useEffect(() => {
    document.title = "Care Needs | Tavara";
  }, []);

  const breadcrumbItems = [
    {
      label: "Family Dashboard",
      path: "/dashboard/family",
    },
    {
      label: "Care Needs",
      path: "/careneeds",
    },
  ];

  return (
    <div className="container px-4 py-8">
      <DashboardHeader breadcrumbItems={breadcrumbItems} />

      <div className="max-w-4xl mx-auto">
        <FadeIn delay={0.1} duration={0.5}>
          <h1 className="text-3xl font-bold mb-2">Family Care Needs</h1>
          <p className="text-muted-foreground mb-8">
            Manage and update care requirements for your loved ones
          </p>
        </FadeIn>

        <div className="space-y-8">
          <SlideIn direction="up" delay={0.2} duration={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>Care Needs Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Complete your care needs assessment to help us understand the specific
                  requirements for your loved ones. This information will be used to match
                  you with appropriate caregivers and services.
                </p>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn direction="up" delay={0.3} duration={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>Current Care Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  View and manage your current care requirements. You can update these
                  as your needs change over time.
                </p>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn direction="up" delay={0.4} duration={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>Care Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Set up your preferred care schedule, including days of the week,
                  times, and frequency of care visits.
                </p>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </div>
    </div>
  );
};

export default FamilyCareNeedsPage;
