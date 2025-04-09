import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { getConversation } from '@/services/chatbot';
import { useChatbotPrefill } from '@/hooks/useChatbotPrefill';
import { FamilyRegistrationFormData } from '@/types/formTypes';
import { UserRole } from '@/types/userRoles';

export default function FamilyRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FamilyRegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from chatbot
  const { 
    isLoading: isPrefillLoading,
    contactInfo,
    careNeeds,
    conversationId,
  } = useChatbotPrefill();

  useEffect(() => {
    if (contactInfo) {
      setFormData(prev => ({
        ...prev,
        firstName: contactInfo.firstName || '',
        lastName: contactInfo.lastName || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        location: contactInfo.location || '',
      }));
    }
  }, [contactInfo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.terms) {
      setError('Please accept the terms and conditions.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('No user session found. Please sign in.');
        setLoading(false);
        return;
      }

      const updates = {
        id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        about: formData.about,
        role: 'family' as UserRole,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        throw error;
      }
      
      if (conversationId) {
        // Update conversation with registration status
        const { error: conversationError } = await supabase
          .from('chatbot_conversations')
          .update({ converted_to_registration: true })
          .eq('id', conversationId);
        
        if (conversationError) {
          console.error('Error updating conversation:', conversationError);
        }
      }

      navigate('/dashboard/family');
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, terms: checked }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Family Profile Registration</h1>
      {isPrefillLoading ? (
        <p>Loading data from chat...</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="grid gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="about">About You</Label>
              <Textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="Tell us about your family and care needs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
              />
              <Label htmlFor="terms">
                I agree to the <a href="/terms" className="text-blue-500">terms and conditions</a>
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-6">
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      )}
    </div>
  );
}
