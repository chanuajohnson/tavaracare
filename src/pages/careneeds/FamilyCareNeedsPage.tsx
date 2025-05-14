
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { getCareNeeds, saveCareNeeds } from '@/services/familyCareNeedsService';
import { DailyLivingSection } from '@/components/careneeds/DailyLivingSection';
import { CognitiveMemorySection } from '@/components/careneeds/CognitiveMemorySection';
import { MedicalConditionsSection } from '@/components/careneeds/MedicalConditionsSection';
import { EmergencySection } from '@/components/careneeds/EmergencySection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HousekeepingSection } from '@/components/careneeds/HousekeepingSection';
import { ShiftPreferencesSection } from '@/components/careneeds/ShiftPreferencesSection';
import { toast } from 'sonner';
import { FadeIn, SlideIn } from '@/components/framer';
import { ScheduleInformationCard } from '@/components/careneeds/ScheduleInformationCard';

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
  const { user, updateOnboardingProgress } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [formData, setFormData] = useState({
    dailyLiving: {},
    cognitiveMemory: {},
    medicalConditions: {},
    emergency: {},
    housekeeping: {},
    shiftPreferences: {}
  });

  useEffect(() => {
    const loadCareNeeds = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        const data = await getCareNeeds(user.id);
        if (data) {
          setFormData({
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
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await saveCareNeeds(user.id, formData);
      
      // Update onboarding progress
      if (updateOnboardingProgress) {
        await updateOnboardingProgress('care_needs');
      }
      
      toast.success('Care needs saved successfully!');
    } catch (error) {
      console.error('Error saving care needs:', error);
      toast.error('Failed to save care needs.');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
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
                      data={formData.dailyLiving} 
                      onChange={(data) => updateSection('dailyLiving', data)}
                      loading={loading}
                    />
                  </SlideIn>
                </TabsContent>

                <TabsContent value="cognitive">
                  <SlideIn direction="up" duration={0.4}>
                    <CognitiveMemorySection 
                      data={formData.cognitiveMemory}
                      onChange={(data) => updateSection('cognitiveMemory', data)}
                      loading={loading}
                    />
                  </SlideIn>
                </TabsContent>

                <TabsContent value="medical">
                  <SlideIn direction="up" duration={0.4}>
                    <MedicalConditionsSection 
                      data={formData.medicalConditions}
                      onChange={(data) => updateSection('medicalConditions', data)}
                      loading={loading}
                    />
                  </SlideIn>
                </TabsContent>

                <TabsContent value="emergency">
                  <SlideIn direction="up" duration={0.4}>
                    <EmergencySection 
                      data={formData.emergency}
                      onChange={(data) => updateSection('emergency', data)}
                      loading={loading}
                    />
                  </SlideIn>
                </TabsContent>

                <TabsContent value="housekeeping">
                  <SlideIn direction="up" duration={0.4}>
                    <HousekeepingSection 
                      data={formData.housekeeping}
                      onChange={(data) => updateSection('housekeeping', data)}
                      loading={loading}
                    />
                  </SlideIn>
                </TabsContent>

                <TabsContent value="shifts">
                  <SlideIn direction="up" duration={0.4}>
                    <ShiftPreferencesSection 
                      data={formData.shiftPreferences}
                      onChange={(data) => updateSection('shiftPreferences', data)}
                      loading={loading}
                    />
                  </SlideIn>
                </TabsContent>
              </Tabs>

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
          <ScheduleInformationCard />
        </div>
      </div>
    </div>
  );
};

export default FamilyCareNeedsPage;
