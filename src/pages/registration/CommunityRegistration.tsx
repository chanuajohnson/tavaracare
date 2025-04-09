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

const CommunityRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    communityName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    missionStatement: '',
    servicesOffered: [],
    website: '',
    socialMediaLinks: '',
    additionalNotes: '',
    termsAndConditions: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Use the hook to prefill data from chatbot
  const { 
    isLoading: isPrefillLoading,
    conversationId,
    contactInfo,
    careNeeds,
    conversation
  } = useChatbotPrefill();

  useEffect(() => {
    if (contactInfo) {
      setFormData(prev => ({
        ...prev,
        contactName: `${contactInfo.firstName || ''} ${contactInfo.lastName || ''}`.trim(),
        email: contactInfo.email || '',
      }));
    }
  }, [contactInfo]);

  const validate = () => {
    let tempErrors = {};

    tempErrors.communityName = formData.communityName ? "" : "Community Name is required";
    tempErrors.contactName = formData.contactName ? "" : "Contact Name is required";
    tempErrors.email = formData.email ? "" : "Email is required";
    tempErrors.phone = formData.phone ? "" : "Phone is required";
    tempErrors.address = formData.address ? "" : "Address is required";
    tempErrors.missionStatement = formData.missionStatement ? "" : "Mission Statement is required";
    tempErrors.termsAndConditions = formData.termsAndConditions ? "" : "Accept Terms & Conditions is required";

    setErrors({ ...tempErrors });

    return Object.values(tempErrors).every(x => x === "");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);

      try {
        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError);
          alert("Failed to get user. Please try again.");
          return;
        }

        const updates = {
          id: user.user.id,
          community_name: formData.communityName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          mission_statement: formData.missionStatement,
          services_offered: formData.servicesOffered,
          website: formData.website,
          social_media_links: formData.socialMediaLinks,
          additional_notes: formData.additionalNotes,
          terms_and_conditions: formData.termsAndConditions,
          updated_at: new Date(),
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(updates);
        
        if (error) {
          throw error;
        }

        alert('Successfully updated community profile!');
        navigate('/dashboard/community');
      } catch (error) {
        console.error("Error creating profile:", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServicesChange = (e: any) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      let updatedServices = [...prev.servicesOffered];
      
      if (checked) {
        updatedServices.push(value);
      } else {
        updatedServices = updatedServices.filter(item => item !== value);
      }
      
      return { ...prev, servicesOffered: updatedServices };
    });
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Community Registration</h1>
      {isPrefillLoading ? (
        <p>Loading prefill data...</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-4">
            <Label htmlFor="communityName">Community Name</Label>
            <Input
              type="text"
              id="communityName"
              name="communityName"
              value={formData.communityName}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.communityName && <p className="text-red-500">{errors.communityName}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.contactName && <p className="text-red-500">{errors.contactName}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.phone && <p className="text-red-500">{errors.phone}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.address && <p className="text-red-500">{errors.address}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="missionStatement">Mission Statement</Label>
            <Textarea
              id="missionStatement"
              name="missionStatement"
              value={formData.missionStatement}
              onChange={handleInputChange}
              className="mt-1"
            />
            {errors.missionStatement && <p className="text-red-500">{errors.missionStatement}</p>}
          </div>

          <div className="mb-4">
            <Label>Services Offered</Label>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <Checkbox
                  value="counseling"
                  checked={formData.servicesOffered.includes('counseling')}
                  onChange={handleServicesChange}
                  className="mr-2"
                />
                <span>Counseling</span>
              </label>
              <label className="inline-flex items-center">
                <Checkbox
                  value="support_groups"
                  checked={formData.servicesOffered.includes('support_groups')}
                  onChange={handleServicesChange}
                  className="mr-2"
                />
                <span>Support Groups</span>
              </label>
              <label className="inline-flex items-center">
                <Checkbox
                  value="educational_programs"
                  checked={formData.servicesOffered.includes('educational_programs')}
                  onChange={handleServicesChange}
                  className="mr-2"
                />
                <span>Educational Programs</span>
              </label>
              <label className="inline-flex items-center">
                <Checkbox
                  value="community_events"
                  checked={formData.servicesOffered.includes('community_events')}
                  onChange={handleServicesChange}
                  className="mr-2"
                />
                <span>Community Events</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="website">Website</Label>
            <Input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="socialMediaLinks">Social Media Links</Label>
            <Input
              type="text"
              id="socialMediaLinks"
              name="socialMediaLinks"
              value={formData.socialMediaLinks}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <Checkbox
                id="termsAndConditions"
                name="termsAndConditions"
                checked={formData.termsAndConditions}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span>I agree to the terms and conditions</span>
            </label>
            {errors.termsAndConditions && <p className="text-red-500">{errors.termsAndConditions}</p>}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default CommunityRegistration;
