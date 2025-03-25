import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const professionalTypes = [
  'Pediatrician',
  'Nurse',
  'Therapist',
  'Counselor',
  'Social Worker',
  'Educator',
  'Care Coordinator',
  'Other'
];

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  professionalType: z.string().min(1, { message: 'Please select your professional type.' }),
  bio: z.string().optional(),
  credentials: z.string().optional(),
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
  availableForConsultation: z.boolean().default(false),
  specialNeeds: z.boolean().default(false),
  palliativeCare: z.boolean().default(false),
  chronicIllness: z.boolean().default(false),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ProfessionalRegistration = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<null | any>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      professionalType: '',
      bio: '',
      credentials: '',
      yearsOfExperience: 0,
      availableForConsultation: false,
      specialNeeds: false,
      palliativeCare: false,
      chronicIllness: false,
      contactEmail: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
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
        
        if (data) {
          setProfileData(data);
          
          form.setValue('firstName', data.first_name || '');
          form.setValue('lastName', data.last_name || '');
          form.setValue('professionalType', data.professional_type || '');
          form.setValue('bio', data.bio || '');
          form.setValue('credentials', data.credentials || '');
          form.setValue('yearsOfExperience', data.years_of_experience || 0);
          form.setValue('availableForConsultation', data.available_for_consultation || false);
          form.setValue('specialNeeds', data.specialties?.includes('special_needs') || false);
          form.setValue('palliativeCare', data.specialties?.includes('palliative_care') || false);
          form.setValue('chronicIllness', data.specialties?.includes('chronic_illness') || false);
          form.setValue('contactEmail', data.contact_email || user.email || '');
          form.setValue('contactPhone', data.contact_phone || '');
        }
      } catch (error) {
        console.error('Error in fetchProfileData:', error);
      }
    };
    
    fetchProfileData();
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const specialties = [];
      if (values.specialNeeds) specialties.push('special_needs');
      if (values.palliativeCare) specialties.push('palliative_care');
      if (values.chronicIllness) specialties.push('chronic_illness');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          full_name: `${values.firstName} ${values.lastName}`,
          professional_type: values.professionalType,
          bio: values.bio,
          credentials: values.credentials,
          years_of_experience: values.yearsOfExperience,
          available_for_consultation: values.availableForConsultation,
          specialties,
          contact_email: values.contactEmail,
          contact_phone: values.contactPhone,
          updated_at: new Date().toISOString(),
          role: 'professional',
        });
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        setLoading(false);
        return;
      }
      
      localStorage.removeItem('registrationSkipped');
      
      toast.success('Profile updated successfully');
      navigate('/dashboard/professional');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipRegistration = () => {
    localStorage.setItem('registrationSkipped', 'true');
    toast.info('You can complete your profile anytime to unlock all features');
    navigate('/dashboard/professional');
  };

  if (!user || userRole !== 'professional') {
    return (
      <div className="container max-w-3xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Professional Registration</CardTitle>
            <CardDescription>You must be logged in as a professional to complete registration.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Professional Registration</CardTitle>
          <CardDescription>
            Complete your profile to help families find you for specialized care needs. This information will be visible to families looking for professionals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="professionalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your profession" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professionalTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Background</h3>
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share a brief description of your background and expertise" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credentials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credentials and Certifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List relevant credentials, certifications, or degrees" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Specialties and Availability</h3>
                
                <FormField
                  control={form.control}
                  name="availableForConsultation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available for Consultation</FormLabel>
                        <CardDescription>
                          Let families know you're available for virtual consultations
                        </CardDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3">
                  <FormLabel>Areas of Expertise</FormLabel>
                  
                  <FormField
                    control={form.control}
                    name="specialNeeds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Special Needs Care</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="palliativeCare"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Palliative Care</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="chronicIllness"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Chronic Illness Management</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@professional-email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSkipRegistration}
                >
                  Skip for now
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalRegistration;
