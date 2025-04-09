
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
import { ProfessionalRegistrationFormData } from '@/types/formTypes';
import { UserRole } from '@/types/userRoles';

const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfessionalRegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    availability: '',
    hourlyRate: '',
    specializations: [],
    certifications: '',
    backgroundCheck: false,
    additionalNotes: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

  const { 
    isLoading, 
    conversationId, 
    contactInfo, 
    careNeeds 
  } = useChatbotPrefill();

  useEffect(() => {
    if (contactInfo) {
      setFormData(prev => ({
        ...prev,
        firstName: contactInfo.firstName || '',
        lastName: contactInfo.lastName || '',
        email: contactInfo.email || '',
      }));
    }
  }, [contactInfo]);

  useEffect(() => {
    supabase.auth.getUser().then((response) => {
      setUserId(response?.data?.user?.id || null);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!userId) {
        console.error('User ID is null. Please ensure the user is authenticated.');
        return;
      }

      // Note: Use profiles table instead of professional_profiles which may not exist
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          years_of_experience: formData.experience,
          availability: [formData.availability], // Convert to array as per schema
          hourly_rate: formData.hourlyRate,
          specializations: formData.specializations,
          certifications: [formData.certifications], // Convert to array as per schema
          background_check: formData.backgroundCheck,
          additional_notes: formData.additionalNotes,
          role: 'professional' as UserRole,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating professional profile:', error);
        alert('Failed to create profile. Please try again.');
        return;
      }

      console.log('Professional profile created successfully:', data);
      alert('Profile created successfully!');
      navigate('/dashboard/professional');
    } catch (error) {
      console.error('Error during profile creation:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => {
      if (prev.specializations.includes(spec)) {
        return {
          ...prev,
          specializations: prev.specializations.filter(s => s !== spec)
        };
      } else {
        return {
          ...prev, 
          specializations: [...prev.specializations, spec]
        };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Professional Registration</h1>
      {isLoading ? (
        <p>Loading data from chat...</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="mb-4">
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
          <div className="mb-4">
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
          <div className="mb-4">
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
          <div className="mb-4">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              type="number"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="availability">Availability</Label>
            <Textarea
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="hourlyRate">Hourly Rate</Label>
            <Input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Label>Specializations</Label>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="seniorCare"
                  checked={formData.specializations.includes('seniorCare')}
                  onCheckedChange={() => toggleSpecialization('seniorCare')}
                />
                <Label htmlFor="seniorCare">Senior Care</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="childCare"
                  checked={formData.specializations.includes('childCare')}
                  onCheckedChange={() => toggleSpecialization('childCare')}
                />
                <Label htmlFor="childCare">Child Care</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="specialNeeds"
                  checked={formData.specializations.includes('specialNeeds')}
                  onCheckedChange={() => toggleSpecialization('specialNeeds')}
                />
                <Label htmlFor="specialNeeds">Special Needs</Label>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              type="text"
              id="certifications"
              name="certifications"
              value={formData.certifications}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="backgroundCheck"
              name="backgroundCheck"
              checked={formData.backgroundCheck}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, backgroundCheck: !!checked }))
              }
            />
            <Label htmlFor="backgroundCheck">Background Check Completed</Label>
          </div>
          <div className="mb-4">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit">Register</Button>
        </form>
      )}
    </div>
  );
};

export default ProfessionalRegistration;
