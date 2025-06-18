import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Define the schema for the form
const familyRegistrationSchema = z.object({
  careRecipientName: z.string().min(2, { message: 'Care recipient name must be at least 2 characters.' }),
  relationship: z.string().min(2, { message: 'Relationship must be at least 2 characters.' }),
  careTypes: z.string().array().min(1, { message: 'Please select at least one type of care needed.' }),
  careRecipientAge: z.string().min(1, { message: 'Please enter the care recipient age.' }),
  physicalCareNeeded: z.string().optional(),
  companionCareNeeded: z.string().optional(),
  medicalCareNeeded: z.string().optional(),
  householdTasksNeeded: z.string().optional(),
  additionalInfo: z.string().optional(),
});

// Define the form type based on the schema
type FamilyRegistrationForm = z.infer<typeof familyRegistrationSchema>;

export default function FamilyRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Use react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FamilyRegistrationForm>({
    resolver: zodResolver(familyRegistrationSchema),
    defaultValues: {
      careTypes: [],
    },
  });

  // Load existing profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);

        // Set default values for the form using correct field names and fallbacks
        setValue('careRecipientName', data?.care_recipient_name || '');
        setValue('relationship', data?.relationship || '');
        setValue('careTypes', data?.care_types || []);
        setValue('careRecipientAge', data?.care_recipient_age || ''); // This field might not exist, will fallback to empty
        setValue('physicalCareNeeded', data?.physical_care_needed || ''); // This field might not exist, will fallback to empty
        setValue('companionCareNeeded', data?.companion_care_needed || ''); // This field might not exist, will fallback to empty
        setValue('medicalCareNeeded', data?.medical_care_needed || ''); // This field might not exist, will fallback to empty
        setValue('householdTasksNeeded', data?.household_tasks_needed || ''); // This field might not exist, will fallback to empty
        setValue('additionalInfo', data?.additional_notes || ''); // Use additional_notes which exists in the schema
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user, setValue]);

  const onSubmit = async (data: FamilyRegistrationForm) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update the user's profile with the registration data
      const { error } = await supabase
        .from('profiles')
        .update({
          care_recipient_name: data.careRecipientName,
          relationship: data.relationship,
          care_types: data.careTypes,
          care_recipient_age: data.careRecipientAge,
          physical_care_needed: data.physicalCareNeeded,
          companion_care_needed: data.companionCareNeeded,
          medical_care_needed: data.medicalCareNeeded,
          household_tasks_needed: data.householdTasksNeeded,
          additional_notes: data.additionalInfo, // Use additional_notes which exists
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to save registration. Please try again.');
        return;
      }

      // Trigger journey progress refresh using multiple methods for reliability
      try {
        // Method 1: Dispatch custom event
        window.dispatchEvent(new CustomEvent('refreshJourneyProgress'));
        
        // Method 2: Set localStorage flag
        localStorage.setItem('family_registration_completed', 'true');
        
        // Method 3: Trigger storage event manually
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'journey_refresh_needed',
          newValue: 'true',
          oldValue: null,
          storageArea: localStorage
        }));
      } catch (eventError) {
        console.error('Error triggering refresh events:', eventError);
      }

      toast.success('Registration completed successfully!');
      
      // Navigate back to dashboard after a short delay to allow refresh to process
      setTimeout(() => {
        navigate('/dashboard/family');
      }, 500);

    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Family Registration</CardTitle>
            <CardDescription>
              Tell us about your care needs so we can better assist you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="careRecipientName">Care Recipient Name</Label>
                <Controller
                  name="careRecipientName"
                  control={control}
                  render={({ field }) => (
                    <Input id="careRecipientName" {...field} />
                  )}
                />
                {errors.careRecipientName && (
                  <p className="text-red-500 text-sm">{errors.careRecipientName.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="relationship">Relationship to Care Recipient</Label>
                <Controller
                  name="relationship"
                  control={control}
                  render={({ field }) => (
                    <Input id="relationship" {...field} />
                  )}
                />
                {errors.relationship && (
                  <p className="text-red-500 text-sm">{errors.relationship.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Types of Care Needed</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="careTypes"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="physicalCare"
                          checked={field.value.includes('physicalCare')}
                          onCheckedChange={(checked) => {
                            const value = checked ? [...field.value, 'physicalCare'] : field.value.filter((v: string) => v !== 'physicalCare');
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Label htmlFor="physicalCare">Physical Care</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="careTypes"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="companionCare"
                          checked={field.value.includes('companionCare')}
                          onCheckedChange={(checked) => {
                            const value = checked ? [...field.value, 'companionCare'] : field.value.filter((v: string) => v !== 'companionCare');
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Label htmlFor="companionCare">Companion Care</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="careTypes"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="medicalCare"
                          checked={field.value.includes('medicalCare')}
                          onCheckedChange={(checked) => {
                            const value = checked ? [...field.value, 'medicalCare'] : field.value.filter((v: string) => v !== 'medicalCare');
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Label htmlFor="medicalCare">Medical Care</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="careTypes"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="householdTasks"
                          checked={field.value.includes('householdTasks')}
                          onCheckedChange={(checked) => {
                            const value = checked ? [...field.value, 'householdTasks'] : field.value.filter((v: string) => v !== 'householdTasks');
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Label htmlFor="householdTasks">Household Tasks</Label>
                  </div>
                </div>
                {errors.careTypes && (
                  <p className="text-red-500 text-sm">{errors.careTypes.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="careRecipientAge">Care Recipient Age</Label>
                <Controller
                  name="careRecipientAge"
                  control={control}
                  render={({ field }) => (
                    <Input id="careRecipientAge" {...field} />
                  )}
                />
                {errors.careRecipientAge && (
                  <p className="text-red-500 text-sm">{errors.careRecipientAge.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="physicalCareNeeded">Physical Care Needed (Optional)</Label>
                <Controller
                  name="physicalCareNeeded"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="physicalCareNeeded" {...field} />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companionCareNeeded">Companion Care Needed (Optional)</Label>
                <Controller
                  name="companionCareNeeded"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="companionCareNeeded" {...field} />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="medicalCareNeeded">Medical Care Needed (Optional)</Label>
                <Controller
                  name="medicalCareNeeded"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="medicalCareNeeded" {...field} />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="householdTasksNeeded">Household Tasks Needed (Optional)</Label>
                <Controller
                  name="householdTasksNeeded"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="householdTasksNeeded" {...field} />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Controller
                  name="additionalInfo"
                  control={control}
                  render={({ field }) => (
                    <Textarea id="additionalInfo" {...field} />
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Registration...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
