import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase, ensureStorageBuckets } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from '../../components/ui/select';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '../../utils/chat/prefillReader';
import { clearChatSessionData } from '../../utils/chat/chatSessionUtils';
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";
import { TRINIDAD_AND_TOBAGO_LOCATIONS, getLocationsByRegion } from '../../constants/locations';

const ProfessionalRegistration = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [customAvailability, setCustomAvailability] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [hasTransportation, setHasTransportation] = useState(false);
  const [additionalSkills, setAdditionalSkills] = useState('');
  const [backgroundCheck, setBackgroundCheck] = useState(false);
  const [references, setReferences] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [userDataPopulated, setUserDataPopulated] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  // Role-based redirect check - this runs first and is critical
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user?.id || roleCheckComplete) return;
      
      try {
        console.log('[ProfessionalRegistration] Checking user role for:', user.id);
        
        // Get user role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('[ProfessionalRegistration] Error fetching user role:', error);
          // Check user metadata as fallback
          const userRole = user.user_metadata?.role;
          if (userRole === 'family') {
            console.log('[ProfessionalRegistration] Family user detected from metadata, redirecting');
            navigate('/registration/family', { replace: true });
            return;
          }
        } else if (profile?.role === 'family') {
          console.log('[ProfessionalRegistration] Family user detected from profile, redirecting');
          navigate('/registration/family', { replace: true });
          return;
        }
        
        console.log('[ProfessionalRegistration] User role check complete, user is professional/undefined');
        setRoleCheckComplete(true);
      } catch (error) {
        console.error('[ProfessionalRegistration] Error in role check:', error);
        setRoleCheckComplete(true);
      }
    };

    checkUserRole();
  }, [user, navigate, roleCheckComplete]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      const shouldAutoRedirect = localStorage.getItem(`tavara_chat_auto_redirect_${sessionId}`);
      if (shouldAutoRedirect === "true") {
        console.log("Auto-submit flag detected from chat flow");
        setShouldAutoSubmit(true);
      }
    }
  }, []);

  useEffect(() => {
    setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    
    return () => {
      sessionStorage.removeItem(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    };
  }, []);

  useEffect(() => {
    if (user && !userDataPopulated) {
      console.log('Pre-populating user data:', user);
      
      if (user.email) {
        setEmail(user.email);
      }
      
      if (user.user_metadata) {
        const metadata = user.user_metadata;
        
        const possibleFirstNames = ['first_name', 'firstName', 'given_name'];
        const possibleLastNames = ['last_name', 'lastName', 'family_name', 'surname'];
        
        for (const field of possibleFirstNames) {
          if (metadata[field]) {
            setFirstName(metadata[field]);
            break;
          }
        }
        
        for (const field of possibleLastNames) {
          if (metadata[field]) {
            setLastName(metadata[field]);
            break;
          }
        }
        
        if (!firstName && !lastName && metadata.full_name) {
          const nameParts = metadata.full_name.split(' ');
          if (nameParts.length >= 2) {
            setFirstName(nameParts[0]);
            setLastName(nameParts.slice(1).join(' '));
          }
        }
      }
      
      setUserDataPopulated(true);
    }
  }, [user, userDataPopulated, firstName, lastName]);

  const setFormValue = (field: string, value: any) => {
    console.log(`Setting form field ${field} to:`, value);
    
    switch (field) {
      case 'first_name':
        setFirstName(value);
        break;
      case 'last_name':
        setLastName(value);
        break;
      case 'phone':
        setPhoneNumber(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'years_experience':
        setYearsExperience(value);
        break;
      case 'hourly_rate':
        setHourlyRate(value);
        break;
      case 'additional_professional_notes':
      case 'additional_skills':
        setAdditionalSkills(value);
        break;
      case 'references':
        setReferences(value);
        break;
      case 'preferred_contact_method':
        setPreferredContactMethod(value);
        break;
      case 'additional_notes':
        setAdditionalNotes(value);
        break;
      case 'willing_to_travel':
        setWillingToTravel(value);
        break;
      case 'has_transportation':
        setHasTransportation(value);
        break;
      case 'background_check':
        setBackgroundCheck(value);
        break;
      default:
        if (field === 'certifications' && Array.isArray(value)) {
          setCertifications(value);
        } else if (field === 'specializations' && Array.isArray(value)) {
          setSpecializations(value);
        } else if (field === 'availability' && Array.isArray(value)) {
          setAvailability(value);
        }
        break;
    }
  };

  useEffect(() => {
    if (!prefillApplied) {
      console.log('Checking for prefill data...');
      
      const hasPrefill = applyPrefillDataToForm(
        setFormValue, 
        { 
          logDataReceived: true,
          checkAutoSubmit: true,
          autoSubmitCallback: () => {
            console.log('Auto-submitting form via callback');
            if (formRef.current) {
              formRef.current.requestSubmit();
            }
          },
          formRef: formRef
        }
      );
      
      if (hasPrefill) {
        console.log('Successfully applied prefill data to form');
        toast.success('Your chat information has been applied to this form');
        
        if (shouldAutoSubmit && user) {
          console.log('Auto-submitting form based on chat completion flow');
          setTimeout(() => {
            if (formRef.current) {
              formRef.current.requestSubmit();
            }
          }, 800);
        }
      }
      
      setPrefillApplied(true);
    }
  }, [prefillApplied, shouldAutoSubmit, user]);

  const handleCheckboxArrayChange = (
    value: string, 
    currentArray: string[], 
    setFunction: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentArray.includes(value)) {
      setFunction(currentArray.filter(item => item !== value));
    } else {
      setFunction([...currentArray, value]);
    }
  };

  const handleAvailabilityChange = (value: string) => {
    setAvailability(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Helper function to handle checkbox boolean state changes
  const handleBooleanCheckboxChange = (
    checked: boolean | "indeterminate",
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (typeof checked === 'boolean') {
      setter(checked);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User ID is missing. Please sign in again.');
      }
      
      if (!firstName || !lastName || !phoneNumber || !location || !address || !yearsExperience) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const updates = {
        id: user.id,
        full_name: fullName,
        phone_number: phoneNumber,
        location: location,
        address: address,
        role: 'professional' as const,
        updated_at: new Date().toISOString(),
        years_of_experience: yearsExperience,
        certifications: certifications || [],
        specializations: specializations || [],
        availability: availability || [], // Keep as array for database
        custom_schedule: customAvailability || '',
        hourly_rate: hourlyRate || '',
        willing_to_travel: willingToTravel,
        has_transportation: hasTransportation,
        additional_professional_notes: additionalSkills || '', // FIXED: Use correct database column name
        background_check_status: backgroundCheck ? 'completed' : 'pending',
        references: references || '',
        preferred_contact_method: preferredContactMethod || '',
        additional_notes: additionalNotes || ''
      };

      console.log('Updating professional profile with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      clearChatSessionData(sessionId || undefined);
      
      if (sessionId) {
        localStorage.removeItem(`tavara_chat_auto_redirect_${sessionId}`);
        localStorage.removeItem(`tavara_chat_transition_${sessionId}`);
      }

      toast.success('Registration Complete! Your professional profile has been updated.');
      
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is resolving OR role check is happening
  if (authLoading || !roleCheckComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">You must be logged in to complete your professional registration.</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const { trinidad, tobago } = getLocationsByRegion();

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="professional_registration_page_view" 
        journeyStage="registration"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Professional Dashboard", path: "/dashboard/professional" },
          { label: "Professional Registration", path: "/registration/professional" }
        ]} 
      />
      
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">Professional Caregiver Registration</h1>
        <p className="text-gray-500 mb-8">
          Complete your professional profile to connect with families in need of care services.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Personal & Contact Information</CardTitle>
              <CardDescription>
                Tell us about yourself so families can learn about your background.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    placeholder="First Name" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Last Name" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} disabled />
                <p className="text-sm text-gray-500">Email address from your registration</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input 
                  id="phoneNumber" 
                  placeholder="Phone Number" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={location} onValueChange={setLocation} required>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Trinidad Locations</SelectLabel>
                      {trinidad.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Tobago Locations</SelectLabel>
                      {tobago.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Detailed Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="Your full street address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
              <CardDescription>
                Share your experience and qualifications in caregiving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <Select value={yearsExperience} onValueChange={setYearsExperience} required>
                  <SelectTrigger id="yearsExperience">
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Less than 1 year</SelectItem>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="4">4 years</SelectItem>
                    <SelectItem value="5">5+ years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Certifications (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'cna', label: '🏥 Certified Nursing Assistant (CNA)', value: 'cna' },
                    { id: 'home_health_aide', label: '🏠 Home Health Aide', value: 'home_health_aide' },
                    { id: 'cpr_certified', label: '❤️ CPR Certified', value: 'cpr_certified' },
                    { id: 'first_aid', label: '🩹 First Aid Certified', value: 'first_aid' },
                    { id: 'medication_admin', label: '💊 Medication Administration', value: 'medication_admin' },
                    { id: 'dementia_care', label: '🧠 Dementia Care Specialist', value: 'dementia_care' },
                    { id: 'physical_therapy', label: '🏃 Physical Therapy Assistant', value: 'physical_therapy' },
                    { id: 'other_cert', label: '✏️ Other (please specify in notes)', value: 'other_cert' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={certifications.includes(item.value)}
                        onCheckedChange={() => handleCheckboxArrayChange(
                          item.value, 
                          certifications, 
                          setCertifications
                        )}
                        className="mt-1"
                      />
                      <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specializations (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'elderly_care', label: '👴 Elderly Care', value: 'elderly_care' },
                    { id: 'disability_care', label: '♿ Disability Care', value: 'disability_care' },
                    { id: 'alzheimers', label: '🧠 Alzheimer\'s Care', value: 'alzheimers' },
                    { id: 'post_surgery', label: '🏥 Post-Surgery Recovery', value: 'post_surgery' },
                    { id: 'chronic_illness', label: '📋 Chronic Illness Management', value: 'chronic_illness' },
                    { id: 'palliative_care', label: '🕊️ Palliative Care', value: 'palliative_care' },
                    { id: 'companionship', label: '👥 Companionship Care', value: 'companionship' },
                    { id: 'respite_care', label: '🔄 Respite Care', value: 'respite_care' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={specializations.includes(item.value)}
                        onCheckedChange={() => handleCheckboxArrayChange(
                          item.value, 
                          specializations, 
                          setSpecializations
                        )}
                        className="mt-1"
                      />
                      <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>📅 Availability & Scheduling</CardTitle>
              <CardDescription>
                When are you available to provide care services?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Availability Schedule</Label>
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Weekday Shifts</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-morning" 
                          checked={availability.includes('weekday_morning')}
                          onCheckedChange={() => handleAvailabilityChange('weekday_morning')}
                        />
                        <Label htmlFor="weekday-morning" className="font-normal">
                          ☀️ Weekday Morning (6 AM - 12 PM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-afternoon" 
                          checked={availability.includes('weekday_afternoon')}
                          onCheckedChange={() => handleAvailabilityChange('weekday_afternoon')}
                        />
                        <Label htmlFor="weekday-afternoon" className="font-normal">
                          🌞 Weekday Afternoon (12 PM - 6 PM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-evening" 
                          checked={availability.includes('weekday_evening')}
                          onCheckedChange={() => handleAvailabilityChange('weekday_evening')}
                        />
                        <Label htmlFor="weekday-evening" className="font-normal">
                          🌆 Weekday Evening (6 PM - 12 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-overnight" 
                          checked={availability.includes('weekday_overnight')}
                          onCheckedChange={() => handleAvailabilityChange('weekday_overnight')}
                        />
                        <Label htmlFor="weekday-overnight" className="font-normal">
                          🌙 Weekday Overnight (12 AM - 6 AM)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Weekend Shifts</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-morning" 
                          checked={availability.includes('weekend_morning')}
                          onCheckedChange={() => handleAvailabilityChange('weekend_morning')}
                        />
                        <Label htmlFor="weekend-morning" className="font-normal">
                          ☀️ Weekend Morning (6 AM - 12 PM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-afternoon" 
                          checked={availability.includes('weekend_afternoon')}
                          onCheckedChange={() => handleAvailabilityChange('weekend_afternoon')}
                        />
                        <Label htmlFor="weekend-afternoon" className="font-normal">
                          🌞 Weekend Afternoon (12 PM - 6 PM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-evening" 
                          checked={availability.includes('weekend_evening')}
                          onCheckedChange={() => handleAvailabilityChange('weekend_evening')}
                        />
                        <Label htmlFor="weekend-evening" className="font-normal">
                          🌆 Weekend Evening (6 PM - 12 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-overnight" 
                          checked={availability.includes('weekend_overnight')}
                          onCheckedChange={() => handleAvailabilityChange('weekend_overnight')}
                        />
                        <Label htmlFor="weekend-overnight" className="font-normal">
                          🌙 Weekend Overnight (12 AM - 6 AM)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Special Availability</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="on-call" 
                          checked={availability.includes('on_call')}
                          onCheckedChange={() => handleAvailabilityChange('on_call')}
                        />
                        <Label htmlFor="on-call" className="font-normal">
                          📞 On-Call / Emergency Availability
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="live-in" 
                          checked={availability.includes('live_in')}
                          onCheckedChange={() => handleAvailabilityChange('live_in')}
                        />
                        <Label htmlFor="live-in" className="font-normal">
                          🏡 Live-In Care Assignments
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="flexible" 
                          checked={availability.includes('flexible')}
                          onCheckedChange={() => handleAvailabilityChange('flexible')}
                        />
                        <Label htmlFor="flexible" className="font-normal">
                          ⏰ Flexible / Negotiable Schedule
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="custom-availability" 
                          checked={availability.includes('custom')}
                          onCheckedChange={() => handleAvailabilityChange('custom')}
                        />
                        <Label htmlFor="custom-availability" className="font-normal">
                          ✏️ Other (Custom availability)
                        </Label>
                      </div>
                      
                      {availability.includes('custom') && (
                        <div className="pt-2 pl-6">
                          <Label htmlFor="customAvailability" className="text-sm mb-1 block">Please specify your custom availability:</Label>
                          <Textarea
                            id="customAvailability"
                            placeholder="Describe your specific availability schedule"
                            value={customAvailability}
                            onChange={(e) => setCustomAvailability(e.target.value)}
                            rows={2}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rate & Logistics</CardTitle>
              <CardDescription>
                Tell us about your rates and logistics preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Preferred Hourly Rate</Label>
                <Select value={hourlyRate} onValueChange={setHourlyRate}>
                  <SelectTrigger id="hourlyRate">
                    <SelectValue placeholder="Select your preferred hourly rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15_20">$15-$20/hour</SelectItem>
                    <SelectItem value="20_25">$20-$25/hour</SelectItem>
                    <SelectItem value="25_30">$25-$30/hour</SelectItem>
                    <SelectItem value="30_35">$30-$35/hour</SelectItem>
                    <SelectItem value="35_plus">$35+/hour</SelectItem>
                    <SelectItem value="negotiable">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="willingToTravel" 
                    checked={willingToTravel}
                    onCheckedChange={(checked) => handleBooleanCheckboxChange(checked, setWillingToTravel)}
                  />
                  <Label htmlFor="willingToTravel" className="font-normal">
                    🚗 Willing to travel to client locations
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasTransportation" 
                    checked={hasTransportation}
                    onCheckedChange={(checked) => handleBooleanCheckboxChange(checked, setHasTransportation)}
                  />
                  <Label htmlFor="hasTransportation" className="font-normal">
                    🚙 Have reliable transportation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="backgroundCheck" 
                    checked={backgroundCheck}
                    onCheckedChange={(checked) => handleBooleanCheckboxChange(checked, setBackgroundCheck)}
                  />
                  <Label htmlFor="backgroundCheck" className="font-normal">
                    ✅ Background check completed
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Share any additional skills or information that would help families.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalSkills">Additional Skills</Label>
                <Textarea 
                  id="additionalSkills" 
                  placeholder="Languages spoken, special training, hobbies, etc." 
                  value={additionalSkills} 
                  onChange={(e) => setAdditionalSkills(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="references">References</Label>
                <Textarea 
                  id="references" 
                  placeholder="Previous employers, supervisors, or clients who can provide references" 
                  value={references} 
                  onChange={(e) => setReferences(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                  <SelectTrigger id="preferredContactMethod">
                    <SelectValue placeholder="Select preferred contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">📞 Phone</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="text">💬 Text Message</SelectItem>
                    <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea 
                  id="additionalNotes" 
                  placeholder="Any additional information you'd like families to know" 
                  value={additionalNotes} 
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;
