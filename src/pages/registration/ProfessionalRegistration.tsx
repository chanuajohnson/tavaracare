import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

const professionalFormSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  professional_type: z.string().min(1, 'Required'),
  additional_notes: z.string().optional(),
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      professional_type: '',
      additional_notes: '',
    },
  });

  const onSubmit = async (data: ProfessionalFormValues) => {
    setIsSubmitting(true);
    try {
      if (!user) throw new Error('User not authenticated');

      const full_name = `${data.first_name} ${data.last_name}`.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name,
          role: 'professional',
          professional_type: data.professional_type,
          first_name: data.first_name,
          last_name: data.last_name,
          registration_skipped: false,
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase.auth.updateUser({ data: { role: 'professional' } });
      toast.success('Profile saved!');
      navigate('/dashboard/professional');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Professional Registration</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Start with the essentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="first-name">First Name *</Label>
                <Input id="first-name" {...register('first_name')} />
                {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last-name">Last Name *</Label>
                <Input id="last-name" {...register('last_name')} />
                {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="professional-type">Professional Role *</Label>
                <Controller
                  control={control}
                  name="professional_type"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="cna">CNA</SelectItem>
                        <SelectItem value="hha">HHA</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.professional_type && <p className="text-red-500 text-sm">{errors.professional_type.message}</p>}
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </Button>
              {!showFullForm && (
                <Button type="button" variant="outline" onClick={() => setShowFullForm(true)}>
                  Continue Registration
                </Button>
              )}
            </div>
            {showFullForm && (
              <div className="mt-6 space-y-6">
                <div>
                  <Label htmlFor="additional-notes">Why do you love caregiving? (optional)</Label>
                  <Textarea
                    id="additional-notes"
                    placeholder="Tell families why you do what you do..."
                    {...register('additional_notes')}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ProfessionalRegistration;
