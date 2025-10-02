import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTracking } from '@/hooks/useTracking';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { WhatsAppButton } from './WhatsAppButton';
import { PayPalDepositButton } from './PayPalDepositButton';

const needsOptions = [
  { id: 'errands_runs', label: '🏃 Errands & runs', value: 'errands_runs' },
  { id: 'child_care', label: '👶 Babysitting / child care', value: 'child_care' },
  { id: 'companion', label: '🤝 Companion / hugs check-in', value: 'companion' },
  { id: 'vehicle_service', label: '🚗 Vehicle pick-up/wash/service', value: 'vehicle_service' },
  { id: 'meds_supplies', label: '💊 Meds & supplies (pharmacy, diapers)', value: 'meds_supplies' },
  { id: 'bill_payments', label: '🧾 Bill payments', value: 'bill_payments' },
  { id: 'school_runs', label: '🚌 School runs', value: 'school_runs' },
  { id: 'meal_prep', label: '🍲 Meal prep / 🧹 Light tidy', value: 'meal_prep' },
  { id: 'pet_care', label: '🐶 Pet care', value: 'pet_care' },
  { id: 'something_else', label: '✍️ Something else', value: 'something_else' }
];

const formSchema = z.object({
  needs: z.array(z.string()).min(1, 'Please select at least one service'),
  urgency: z.string().min(1, 'Please select urgency'),
  location: z.string().min(1, 'Please enter your location'),
  recipient: z.string().min(1, 'Please specify who this is for'),
  name: z.string().min(1, 'Please enter your name'),
  phone: z.string().min(1, 'Please enter your phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  notes: z.string().optional(),
  consent: z.boolean().refine(val => val === true, 'You must acknowledge this is a paid service')
});

type FormData = z.infer<typeof formSchema>;

export const ErrandsForm: React.FC = () => {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const { trackEngagement } = useTracking();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      needs: [],
      consent: false
    }
  });

  const urgency = watch('urgency');

  const handleNeedToggle = (needValue: string) => {
    const newNeeds = selectedNeeds.includes(needValue)
      ? selectedNeeds.filter(n => n !== needValue)
      : [...selectedNeeds, needValue];
    
    setSelectedNeeds(newNeeds);
    setValue('needs', newNeeds);
  };

  const calculatePriority = (urgency: string, needs: string[]): 'P1' | 'P2' | 'P3' => {
    // P1 for urgent or child/elder/medical needs
    if (urgency === 'now' || 
        needs.some(need => ['child_care', 'meds_supplies', 'companion'].includes(need))) {
      return 'P1';
    }
    
    // P2 for today/this week
    if (urgency === 'today' || urgency === 'this_week') {
      return 'P2';
    }
    
    // P3 for scheduled future
    return 'P3';
  };

  const onSubmit = async (data: FormData) => {
    try {
      const priority = calculatePriority(data.urgency, data.needs);
      
      // Store lead data
      const leadData = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        location: data.location,
        urgency: data.urgency,
        recipient: data.recipient,
        needs: data.needs,
        notes: data.notes || null,
        priority,
        has_deposit: false,
        source: '/errands'
      };

      // Track engagement
      await trackEngagement('errands_form_submit', leadData);

      // Store in database
      await supabase.from('cta_engagement_tracking').insert({
        action_type: 'errands_lead_capture',
        additional_data: leadData
      });

      setFormData(data);
      setIsSubmitted(true);
      
      toast.success('Request submitted successfully!', {
        description: 'You can now message our team directly on WhatsApp.'
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit request', {
        description: 'Please try again or contact us directly.'
      });
    }
  };

  if (isSubmitted && formData) {
    return (
      <Card className="mb-8 shadow-lg">
        <CardContent className="mobile-padding-responsive text-center bg-gradient-to-br from-green-50 to-primary/5 py-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              Request Received! 💙
            </h2>
            <p className="text-muted-foreground mb-4 mobile-text-responsive">
              Thanks for reaching out! Message our team directly on WhatsApp to coordinate your booking.
            </p>
          </div>
          
          <div className="space-y-4 max-w-md mx-auto">
            <WhatsAppButton formData={formData} />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Want to secure your booking? Add a deposit now
              </p>
              <PayPalDepositButton />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Support (≤30 seconds)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Needs Selection */}
          <div className="space-y-2">
            <Label>What do you need help with? (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {needsOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedNeeds.includes(option.value)}
                    onCheckedChange={() => handleNeedToggle(option.value)}
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.needs && (
              <p className="text-sm text-destructive">{errors.needs.message}</p>
            )}
          </div>

          {/* Notes for "Something else" */}
          {selectedNeeds.includes('something_else') && (
            <div className="space-y-2">
              <Label htmlFor="notes">Please describe what you need</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Describe your specific needs..."
                rows={3}
              />
            </div>
          )}

          {/* Urgency */}
          <div className="space-y-2">
            <Label>When do you need this?</Label>
            <Select onValueChange={(value) => setValue('urgency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="now">🚨 Right now (urgent)</SelectItem>
                <SelectItem value="today">📅 Today</SelectItem>
                <SelectItem value="this_week">📆 This week</SelectItem>
                <SelectItem value="pick_date">🗓️ Let me pick a date</SelectItem>
              </SelectContent>
            </Select>
            {errors.urgency && (
              <p className="text-sm text-destructive">{errors.urgency.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Area + Landmark)</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., Diego Martin, near Movie Towne"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>Who is this for?</Label>
            <Select onValueChange={(value) => setValue('recipient', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">👤 Me</SelectItem>
                <SelectItem value="parent">👨‍👩‍👧‍👦 Parent</SelectItem>
                <SelectItem value="child">👶 Child</SelectItem>
                <SelectItem value="partner">💑 Partner</SelectItem>
                <SelectItem value="other">👥 Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.recipient && (
              <p className="text-sm text-destructive">{errors.recipient.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Full name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Number *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="868-xxx-xxxx"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              {...register('consent')}
              onCheckedChange={(checked) => setValue('consent', checked as boolean)}
            />
            <Label htmlFor="consent" className="text-sm font-normal cursor-pointer">
              I understand Tavara is a paid service and agree to the pricing shown above.
            </Label>
          </div>
          {errors.consent && (
            <p className="text-sm text-destructive">{errors.consent.message}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};