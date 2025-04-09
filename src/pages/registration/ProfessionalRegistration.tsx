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

const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState('');
  const [backgroundCheck, setBackgroundCheck] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
	const [userId, setUserId] = useState<string | null>(null);

  const { 
    isLoading, 
    conversationId, 
    contactInfo, 
    careNeeds 
  } = useChatbotPrefill();

  useEffect(() => {
    if (contactInfo) {
      setFirstName(contactInfo.firstName || '');
      setLastName(contactInfo.lastName || '');
      setEmail(contactInfo.email || '');
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

      const { data, error } = await supabase
        .from('professional_profiles')
        .insert([
          {
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            location: location,
            experience: experience,
            availability: availability,
            hourly_rate: hourlyRate,
            specializations: specializations,
            certifications: certifications,
            background_check: backgroundCheck,
            additional_notes: additionalNotes,
          },
        ]);

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
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              type="number"
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="availability">Availability</Label>
            <Textarea
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="hourlyRate">Hourly Rate</Label>
            <Input
              type="number"
              id="hourlyRate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <Label>Specializations</Label>
            <div>
              <Checkbox
                id="seniorCare"
                checked={specializations.includes('seniorCare')}
                onCheckedChange={() => toggleSpecialization('seniorCare')}
              />
              <Label htmlFor="seniorCare" className="ml-2">Senior Care</Label>
            </div>
            <div>
              <Checkbox
                id="childCare"
                checked={specializations.includes('childCare')}
                onCheckedChange={() => toggleSpecialization('childCare')}
              />
              <Label htmlFor="childCare" className="ml-2">Child Care</Label>
            </div>
            <div>
              <Checkbox
                id="specialNeeds"
                checked={specializations.includes('specialNeeds')}
                onCheckedChange={() => toggleSpecialization('specialNeeds')}
              />
              <Label htmlFor="specialNeeds" className="ml-2">Special Needs</Label>
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              type="text"
              id="certifications"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
            />
          </div>
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="backgroundCheck"
              checked={backgroundCheck}
              onCheckedChange={(checked) => setBackgroundCheck(!!checked)}
            />
            <Label htmlFor="backgroundCheck">Background Check Completed</Label>
          </div>
          <div className="mb-4">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>
          <Button type="submit">Register</Button>
        </form>
      )}
    </div>
  );
};

export default ProfessionalRegistration;
