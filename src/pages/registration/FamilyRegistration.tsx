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

export default function FamilyRegistration() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [terms, setTerms] = useState(false);
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
      setFirstName(contactInfo.firstName || '');
      setLastName(contactInfo.lastName || '');
      setEmail(contactInfo.email || '');
      setPhone(contactInfo.phone || '');
      setLocation(contactInfo.location || '');
    }
  }, [contactInfo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!terms) {
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
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        location: location,
        about: about,
        role: 'family',
        updated_at: new Date(),
      };

      let { error } = await supabase
        .from('profiles')
        .upsert(updates, { returning: 'minimal' });

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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="about">About You</Label>
              <Textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about your family and care needs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(checked) => setTerms(!!checked)}
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
