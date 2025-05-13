
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, SlideIn } from '@/components/framer';
import { DailyLivingSection } from '@/components/careneeds/DailyLivingSection';
import { CognitiveMemorySection } from '@/components/careneeds/CognitiveMemorySection';
import { MedicalConditionsSection } from '@/components/careneeds/MedicalConditionsSection';
import { HousekeepingSection } from '@/components/careneeds/HousekeepingSection';
import { EmergencySection } from '@/components/careneeds/EmergencySection';
import { ShiftPreferencesSection } from '@/components/careneeds/ShiftPreferencesSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FamilyCareNeedsPage = () => {
  const [activeTab, setActiveTab] = useState('daily-living');
  
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard/family' },
    { label: 'Care Needs Assessment', path: '/careneeds' }
  ];

  return (
    <div className="container mx-auto py-8">
      <FadeIn>
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
      </FadeIn>
      
      <SlideIn delay={0.1}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Care Needs Assessment</CardTitle>
            <CardDescription>
              Help us understand your loved one's care needs so we can provide appropriate support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please complete all sections of this assessment. The more details you provide, the better 
              we can match caregivers and develop an effective care plan.
            </p>
          </CardContent>
        </Card>
      </SlideIn>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="daily-living">Daily Living</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
        </TabsList>
        
        <SlideIn delay={0.2}>
          <TabsContent value="daily-living" className="mt-6">
            <DailyLivingSection />
          </TabsContent>
          
          <TabsContent value="cognitive" className="mt-6">
            <CognitiveMemorySection />
          </TabsContent>
          
          <TabsContent value="medical" className="mt-6">
            <MedicalConditionsSection />
          </TabsContent>
          
          <TabsContent value="housekeeping" className="mt-6">
            <HousekeepingSection />
          </TabsContent>
          
          <TabsContent value="emergency" className="mt-6">
            <EmergencySection />
          </TabsContent>
          
          <TabsContent value="shifts" className="mt-6">
            <ShiftPreferencesSection />
          </TabsContent>
        </SlideIn>
      </Tabs>
    </div>
  );
};

export default FamilyCareNeedsPage;
