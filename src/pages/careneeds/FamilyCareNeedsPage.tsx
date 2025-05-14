
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { getCareNeeds, saveCareNeeds } from '@/services/familyCareNeedsService';
import DailyLivingSection from '@/components/careneeds/DailyLivingSection';
import CognitiveMemorySection from '@/components/careneeds/CognitiveMemorySection';
import MedicalConditionsSection from '@/components/careneeds/MedicalConditionsSection';
import EmergencySection from '@/components/careneeds/EmergencySection';
import { FadeIn, SlideIn } from '@/components/framer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HousekeepingSection from '@/components/careneeds/HousekeepingSection';
import ShiftPreferencesSection from '@/components/careneeds/ShiftPreferencesSection';
import { FormProvider } from 'react-hook-form';
import { useAuth } from '@/components/providers/AuthProvider';
import ScheduleInformationCard from '@/components/careneeds/ScheduleInformationCard';

// Define care needs schema
const careNeedsSchema = z.object({
  dailyLiving: z.object({}).catchall(z.any()),
  cognitiveMemory: z.object({}).catchall(z.any()),
  medicalConditions: z.object({}).catchall(z.any()),
  emergency: z.object({}).catchall(z.any()),
  housekeeping: z.object({}).catchall(z.any()),
  shiftPreferences: z.object({}).catchall(z.any()),
});

type CareNeedsFormValues = z.infer<typeof careNeedsSchema>;

const FamilyCareNeedsPage = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState('dailyLiving');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Setup form with React Hook Form
  const form = useForm<CareNeedsFormValues>({
    resolver: zodResolver(careNeedsSchema),
    defaultValues: {
      dailyLiving: {},
      cognitiveMemory: {},
      medicalConditions: {},
      emergency: {},
      housekeeping: {},
      shiftPreferences: {},
    },
  });

  // Load existing care needs data
  React.useEffect(() => {
    const loadCareNeeds = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const data = await getCareNeeds(userId);
        
        if (data) {
          // Populate form with existing data
          Object.entries(data).forEach(([key, value]) => {
            if (key in form.getValues()) {
              form.setValue(key as keyof CareNeedsFormValues, value as any);
            }
          });
        }
      } catch (error) {
        console.error('Error loading care needs:', error);
        toast.error('Failed to load care needs');
      } finally {
        setLoading(false);
      }
    };

    loadCareNeeds();
  }, [userId, form]);

  // Handle form submission
  const onSubmit = async (data: CareNeedsFormValues) => {
    if (!userId) {
      toast.error('Must be logged in to save care needs');
      return;
    }
    
    try {
      setSaving(true);
      await saveCareNeeds(userId, data);
      toast.success('Care needs saved successfully');
    } catch (error) {
      console.error('Error saving care needs:', error);
      toast.error('Failed to save care needs');
    } finally {
      setSaving(false);
    }
  };

  // Handle field value changes for the ScheduleInformationCard
  const handleScheduleInfoChange = (name: string, value: any) => {
    // Use the form's setValue method with the proper nested path
    form.setValue(`shiftPreferences` as any, {
      ...form.getValues().shiftPreferences,
      [name]: value
    });
  };

  return (
    <FormProvider {...form}>
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        <FadeIn 
          className="mb-6" 
          duration={0.5}
          delay={0}
        >
          <h1 className="text-3xl font-bold mb-2">Care Needs Assessment</h1>
          <p className="text-gray-600">
            Help us understand the specific care requirements to match you with the right caregivers
          </p>
        </FadeIn>

        <SlideIn
          direction="up"
          className="mb-8"
          duration={0.5}
          delay={0.1}
        >
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Select care categories to provide details</h2>
              <Button 
                type="submit" 
                disabled={saving}
                className="ml-auto"
              >
                {saving ? 'Saving...' : 'Save Care Needs'}
              </Button>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="md:col-span-2 lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="dailyLiving">Daily Living</TabsTrigger>
                    <TabsTrigger value="cognitiveMemory">Cognitive</TabsTrigger>
                    <TabsTrigger value="medicalConditions">Medical</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                    <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
                    <TabsTrigger value="shiftPreferences">Scheduling</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6 bg-white rounded-lg border p-6">
                    <TabsContent value="dailyLiving">
                      <DailyLivingSection form={form} />
                    </TabsContent>
                    
                    <TabsContent value="cognitiveMemory">
                      <CognitiveMemorySection form={form} />
                    </TabsContent>
                    
                    <TabsContent value="medicalConditions">
                      <MedicalConditionsSection form={form} />
                    </TabsContent>
                    
                    <TabsContent value="emergency">
                      <EmergencySection form={form} />
                    </TabsContent>
                    
                    <TabsContent value="housekeeping">
                      <HousekeepingSection form={form} />
                    </TabsContent>
                    
                    <TabsContent value="shiftPreferences">
                      <ShiftPreferencesSection form={form} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
              
              <div className="w-full lg:w-1/3">
                <ScheduleInformationCard 
                  formData={form.getValues().shiftPreferences || {}}
                  onChange={handleScheduleInfoChange}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button 
                type="submit" 
                disabled={saving}
                className="min-w-[150px]"
              >
                {saving ? 'Saving...' : 'Save Care Needs'}
              </Button>
            </div>
          </form>
        </SlideIn>
      </div>
    </FormProvider>
  );
};

export default FamilyCareNeedsPage;
