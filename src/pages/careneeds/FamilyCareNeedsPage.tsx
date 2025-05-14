
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { fetchFamilyCareNeeds, saveFamilyCareNeeds } from '@/services/familyCareNeedsService';
import DailyLivingSection from '@/components/careneeds/DailyLivingSection';
import CognitiveMemorySection from '@/components/careneeds/CognitiveMemorySection';
import MedicalConditionsSection from '@/components/careneeds/MedicalConditionsSection';
import EmergencySection from '@/components/careneeds/EmergencySection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HousekeepingSection from '@/components/careneeds/HousekeepingSection';
import ShiftPreferencesSection from '@/components/careneeds/ShiftPreferencesSection';
import { toast } from 'sonner';
import { FadeIn, SlideIn } from '@/components/framer';
import ScheduleInformationCard from '@/components/careneeds/ScheduleInformationCard';
import { useForm, FormProvider } from 'react-hook-form';

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard/family"
  },
  {
    label: "Care Needs",
    path: "/careneeds"
  }
];

const FamilyCareNeedsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const form = useForm({
    defaultValues: {
      dailyLiving: {},
      cognitiveMemory: {},
      medicalConditions: {},
      emergency: {},
      housekeeping: {},
      shiftPreferences: {}
    }
  });

  useEffect(() => {
    const loadCareNeeds = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        const data = await fetchFamilyCareNeeds(user.id);
        if (data) {
          form.reset({
            dailyLiving: data.dailyLiving || {},
            cognitiveMemory: data.cognitiveMemory || {},
            medicalConditions: data.medicalConditions || {},
            emergency: data.emergency || {},
            housekeeping: data.housekeeping || {},
            shiftPreferences: data.shiftPreferences || {}
          });
        }
      } catch (error) {
        console.error('Error loading care needs:', error);
        toast.error('Failed to load care needs information.');
      } finally {
        setLoading(false);
      }
    };

    loadCareNeeds();
  }, [user, navigate, form]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const formData = form.getValues();
      await saveFamilyCareNeeds({
        profileId: user.id,
        ...formData
      });
      
      // Update onboarding progress is handled in the service now
      toast.success('Care needs saved successfully!');
    } catch (error) {
      console.error('Error saving care needs:', error);
      toast.error('Failed to save care needs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container px-4 py-8">
      <FadeIn duration={0.3} className="mb-4">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <FadeIn className="mb-6" duration={0.5}>
            <h1 className="text-3xl font-bold">Care Needs Assessment</h1>
            <p className="text-muted-foreground mt-1">
              Help us understand your loved one's care requirements
            </p>
          </FadeIn>

          <Card>
            <CardHeader>
              <CardTitle>Care Requirements</CardTitle>
              <CardDescription>
                Please complete each section to help us understand the specific care needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="daily">Daily Living</TabsTrigger>
                    <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
                    <TabsTrigger value="medical">Medical</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                    <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
                    <TabsTrigger value="shifts">Scheduling</TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily">
                    <SlideIn direction="up" duration={0.4}>
                      <DailyLivingSection 
                        form={form}
                      />
                    </SlideIn>
                  </TabsContent>

                  <TabsContent value="cognitive">
                    <SlideIn direction="up" duration={0.4}>
                      <CognitiveMemorySection 
                        form={form}
                      />
                    </SlideIn>
                  </TabsContent>

                  <TabsContent value="medical">
                    <SlideIn direction="up" duration={0.4}>
                      <MedicalConditionsSection 
                        form={form}
                      />
                    </SlideIn>
                  </TabsContent>

                  <TabsContent value="emergency">
                    <SlideIn direction="up" duration={0.4}>
                      <EmergencySection 
                        form={form}
                      />
                    </SlideIn>
                  </TabsContent>

                  <TabsContent value="housekeeping">
                    <SlideIn direction="up" duration={0.4}>
                      <HousekeepingSection 
                        form={form}
                      />
                    </SlideIn>
                  </TabsContent>

                  <TabsContent value="shifts">
                    <SlideIn direction="up" duration={0.4}>
                      <ShiftPreferencesSection 
                        form={form}
                      />
                    </SlideIn>
                  </TabsContent>
                </Tabs>
              </FormProvider>

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const tabs = ['daily', 'cognitive', 'medical', 'emergency', 'housekeeping', 'shifts'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === 'daily'}
                >
                  Previous
                </Button>
                {activeTab === 'shifts' ? (
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Care Needs'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      const tabs = ['daily', 'cognitive', 'medical', 'emergency', 'housekeeping', 'shifts'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/3">
          <ScheduleInformationCard 
            formData={form.getValues().shiftPreferences || {}}
            onChange={(name, value) => {
              form.setValue(`shiftPreferences.${name}`, value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FamilyCareNeedsPage;
