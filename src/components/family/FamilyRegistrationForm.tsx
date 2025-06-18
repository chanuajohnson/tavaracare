
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const familyRegistrationSchema = z.object({
  // Personal Information
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  
  // Care Recipient Information
  care_recipient_name: z.string().min(2, 'Care recipient name is required'),
  relationship_to_care_recipient: z.string().min(1, 'Relationship is required'),
  care_recipient_age: z.string().optional(),
  
  // Care Needs
  primary_care_needs: z.array(z.string()).min(1, 'At least one care need must be selected'),
  special_conditions: z.array(z.string()).optional(),
  care_urgency: z.string().min(1, 'Care urgency is required'),
  
  // Schedule & Location
  preferred_schedule: z.string().min(1, 'Preferred schedule is required'),
  care_location: z.string().min(5, 'Care location is required'),
  
  // Budget & Preferences
  budget_range: z.string().min(1, 'Budget range is required'),
  caregiver_preferences: z.array(z.string()).optional(),
  
  // Additional Information
  additional_notes: z.string().optional(),
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
});

type FamilyRegistrationData = z.infer<typeof familyRegistrationSchema>;

const careNeedsOptions = [
  'Personal Care (bathing, dressing)',
  'Medication Management', 
  'Mobility Assistance',
  'Companionship',
  'Meal Preparation',
  'Light Housekeeping',
  'Transportation',
  'Memory Care Support'
];

const specialConditionsOptions = [
  'Alzheimer\'s/Dementia',
  'Diabetes',
  'Heart Conditions',
  'Mobility Issues',
  'Mental Health Support',
  'Post-Surgery Recovery',
  'Chronic Pain Management'
];

const caregiverPreferencesOptions = [
  'Female Caregiver',
  'Male Caregiver', 
  'Bilingual (Spanish)',
  'Experience with Dementia',
  'Medical Training (RN/LPN)',
  'Pet Friendly',
  'Non-Smoker'
];

interface FamilyRegistrationFormProps {
  onComplete?: () => void;
}

export const FamilyRegistrationForm: React.FC<FamilyRegistrationFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FamilyRegistrationData>({
    resolver: zodResolver(familyRegistrationSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone_number: user?.user_metadata?.phone_number || '',
      primary_care_needs: [],
      special_conditions: [],
      caregiver_preferences: [],
      terms_accepted: false
    }
  });

  const onSubmit = async (data: FamilyRegistrationData) => {
    if (!user) {
      toast.error('You must be logged in to register');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          role: 'family',
          registration_completed: true,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Create care needs entry
      const { error: careNeedsError } = await supabase
        .from('care_needs_family')
        .upsert({
          profile_id: user.id,
          care_recipient_name: data.care_recipient_name,
          relationship: data.relationship_to_care_recipient,
          primary_care_needs: data.primary_care_needs,
          special_conditions: data.special_conditions,
          care_urgency: data.care_urgency,
          preferred_schedule: data.preferred_schedule,
          care_location: data.care_location,
          budget_range: data.budget_range,
          caregiver_preferences: data.caregiver_preferences,
          additional_notes: data.additional_notes,
          updated_at: new Date().toISOString()
        });

      if (careNeedsError) throw careNeedsError;

      // Create care recipient profile
      const { error: recipientError } = await supabase
        .from('care_recipient_profiles')
        .upsert({
          user_id: user.id,
          full_name: data.care_recipient_name,
          birth_year: data.care_recipient_age || '',
          last_updated: new Date().toISOString()
        });

      if (recipientError) throw recipientError;

      toast.success('Registration completed successfully!');
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard/family');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Care Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Care Recipient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="care_recipient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Care Recipient's Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of person receiving care" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship_to_care_recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Relationship *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="relative">Other Relative</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="care_recipient_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Age of care recipient" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Care Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Care Needs & Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="primary_care_needs"
                render={() => (
                  <FormItem>
                    <FormLabel>Primary Care Needs * (Select all that apply)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {careNeedsOptions.map((need) => (
                        <FormField
                          key={need}
                          control={form.control}
                          name="primary_care_needs"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(need)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, need])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== need)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {need}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="special_conditions"
                render={() => (
                  <FormItem>
                    <FormLabel>Special Conditions (Select any that apply)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {specialConditionsOptions.map((condition) => (
                        <FormField
                          key={condition}
                          control={form.control}
                          name="special_conditions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(condition)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), condition])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== condition)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {condition}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="care_urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How soon do you need care? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="immediate" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Immediately (within 1-2 days)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="this-week" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            This week
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="next-week" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Next week
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="planning-ahead" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Planning ahead (more than 2 weeks)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Schedule & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="preferred_schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Schedule *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred schedule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                        <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                        <SelectItem value="overnight">Overnight (10 PM - 8 AM)</SelectItem>
                        <SelectItem value="full-day">Full Day (8+ hours)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="care_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State or ZIP code" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where will care be provided? (City and state or ZIP code)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Budget & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Caregiver Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="budget_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range (per hour) *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="20-25">$20 - $25/hour</SelectItem>
                        <SelectItem value="25-30">$25 - $30/hour</SelectItem>
                        <SelectItem value="30-35">$30 - $35/hour</SelectItem>
                        <SelectItem value="35-40">$35 - $40/hour</SelectItem>
                        <SelectItem value="40-plus">$40+ /hour</SelectItem>
                        <SelectItem value="discuss">Prefer to discuss</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caregiver_preferences"
                render={() => (
                  <FormItem>
                    <FormLabel>Caregiver Preferences (Select any that apply)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {caregiverPreferencesOptions.map((preference) => (
                        <FormField
                          key={preference}
                          control={form.control}
                          name="caregiver_preferences"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(preference)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), preference])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== preference)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {preference}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes or Special Requests</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please share any additional information that would help us find the perfect caregiver for your situation..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell us about any specific needs, preferences, or concerns we should know about.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms_accepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I accept the Terms of Service and Privacy Policy *
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you agree to our terms and conditions.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
