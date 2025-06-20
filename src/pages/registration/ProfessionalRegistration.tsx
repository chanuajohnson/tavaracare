import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase, ensureStorageBuckets, ensureAuthContext } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageViewTracker } from "@/components/tracking/PageViewTracker";
import { toast } from 'sonner';
import { Calendar, Sun, Moon, Clock } from "lucide-react";
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '../../utils/chat/prefillReader';
import { clearChatSessionData } from '../../utils/chat/chatSessionUtils';
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";

// Import standardized shift options from chat registration flows
import { STANDARDIZED_SHIFT_OPTIONS } from '../../data/chatRegistrationFlows';

const ProfessionalRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [careSchedule, setCareSchedule] = useState<string[]>([]); // Changed from availability to careSchedule
  const [customAvailability, setCustomAvailability] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [transportation, setTransportation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [backgroundCheck, setBackgroundCheck] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  const [user, setUser] = useState<any>(null);
  const [authSession, setAuthSession] = useState<any>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  // Check for auto-redirect flag from chat
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
    // Prevent auth redirection by setting specific flag for registration
    setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    
    // Clean up on unmount
    return () => {
      sessionStorage.removeItem(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    };
  }, []);

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
        setAddress(value);
        break;
      case 'years_of_experience':
        setYearsOfExperience(value);
        break;
      case 'hourly_rate':
        setHourlyRate(value);
        break;
      case 'transportation':
        setTransportation(value);
        break;
      case 'preferred_locations':
        setPreferredLocations(value);
        break;
      case 'emergency_contact':
        setEmergencyContact(value);
        break;
      case 'background_check':
        setBackgroundCheck(value);
        break;
      case 'additional_info':
        setAdditionalInfo(value);
        break;
      default:
        // Handle array fields
        if (field === 'specialties' && Array.isArray(value)) {
          setSpecialties(value);
        } else if (field === 'certifications' && Array.isArray(value)) {
          setCertifications(value);
        } else if (field === 'care_schedule' && Array.isArray(value)) {
          setCareSchedule(value);
        } else if (field === 'languages' && Array.isArray(value)) {
          setLanguages(value);
        }
        break;
    }
  };

  // Apply prefill data when available
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

  const handleCareScheduleChange = (value: string) => {
    setCareSchedule(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contextValid = await ensureAuthContext();
      if (!contextValid) {
        throw new Error('Authentication context could not be established');
      }
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error('Your session has expired. Please sign in again.');
        navigate('/auth');
        return;
      }
      
      if (!user?.id) {
        throw new Error('User ID is missing. Please sign in again.');
      }
      
      if (!firstName || !lastName || !phoneNumber || !address || !yearsOfExperience) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      let uploadedAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        try {
          await ensureStorageBuckets();
          
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
              contentType: avatarFile.type,
              upsert: true,
            });

          if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            toast.warning('Could not upload profile picture. Continuing with registration.');
          } else if (data) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            uploadedAvatarUrl = urlData.publicUrl;
          }
        } catch (storageErr) {
          console.error('Storage operation failed:', storageErr);
          toast.warning('Storage system unavailable. Skipping profile picture.');
        }
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        phone_number: phoneNumber,
        address: address,
        role: 'professional' as const,
        updated_at: new Date().toISOString(),
        years_of_experience: yearsOfExperience,
        specialties: specialties || [],
        certifications: certifications || [],
        care_schedule: careSchedule.join(',') || '', // Changed to match family registration format
        custom_availability: customAvailability || '',
        preferred_work_locations: preferredLocations || '',
        hourly_rate: hourlyRate || '',
        transportation: transportation || '',
        languages: languages || [],
        emergency_contact: emergencyContact || '',
        background_check: backgroundCheck ? backgroundCheck === 'yes' || backgroundCheck === 'true' : null,
        additional_info: additionalInfo || ''
      };

      console.log('Updating professional profile with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Get session ID from URL to clear specific flags
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      // Clear chat session data including auto-redirect flag
      clearChatSessionData(sessionId || undefined);
      
      // Also clear the auto-redirect flag specifically
      if (sessionId) {
        localStorage.removeItem(`tavara_chat_auto_redirect_${sessionId}`);
        localStorage.removeItem(`tavara_chat_transition_${sessionId}`);
      }

      toast.success('Registration Complete! Your professional caregiver profile has been updated.');
      
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          Complete your professional profile to connect with families who need your caregiving skills.
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
                <Label htmlFor="address">Location – Your service area *</Label>
                <Input 
                  id="address" 
                  placeholder="Address/City where you provide services" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Professional Experience & Specialties</CardTitle>
              <CardDescription>
                Share your caregiving experience and areas of expertise.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Select value={yearsOfExperience} onValueChange={setYearsOfExperience} required>
                  <SelectTrigger id="yearsOfExperience">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                    <SelectItem value="1-2 years">1-2 years</SelectItem>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="6-10 years">6-10 years</SelectItem>
                    <SelectItem value="More than 10 years">More than 10 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Care Specialties – What type of care do you provide? (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'specialty-inhome', label: '🏠 In-Home Care', value: 'In-Home Care' },
                    { id: 'specialty-medical', label: '🏥 Medical Support', value: 'Medical Support' },
                    { id: 'specialty-therapeutic', label: '🌱 Therapeutic Support', value: 'Therapeutic Support' },
                    { id: 'specialty-specialneeds', label: '🎓 Special Needs Support', value: 'Special Needs Support' },
                    { id: 'specialty-cognitive', label: '🧠 Cognitive & Memory Care', value: 'Cognitive & Memory Care' },
                    { id: 'specialty-mobility', label: '♿ Mobility Assistance', value: 'Mobility Assistance' },
                    { id: 'specialty-medication', label: '💊 Medication Management', value: 'Medication Management' },
                    { id: 'specialty-nutrition', label: '🍽️ Nutritional Assistance', value: 'Nutritional Assistance' },
                    { id: 'specialty-household', label: '🏡 Household Assistance', value: 'Household Assistance' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={specialties.includes(item.value)}
                        onCheckedChange={() => handleCheckboxArrayChange(
                          item.value, 
                          specialties, 
                          setSpecialties
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
              <CardTitle>📅 Availability & Schedule Preferences</CardTitle>
              <CardDescription>
                Let families know when you're available to provide care services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Your Availability – When are you available to work?</Label>
                <p className="text-sm text-gray-500 mb-4">Select all time slots when you're available to provide care. This helps us match you with families who need care during these hours.</p>
                
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium">Standard Weekday Shifts</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="mon_fri_8am_4pm" 
                          checked={careSchedule.includes('mon_fri_8am_4pm')}
                          onCheckedChange={() => handleCareScheduleChange('mon_fri_8am_4pm')}
                        />
                        <Label htmlFor="mon_fri_8am_4pm" className="font-normal">
                          ☀️ Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="mon_fri_8am_6pm" 
                          checked={careSchedule.includes('mon_fri_8am_6pm')}
                          onCheckedChange={() => handleCareScheduleChange('mon_fri_8am_6pm')}
                        />
                        <Label htmlFor="mon_fri_8am_6pm" className="font-normal">
                          🕕 Monday – Friday, 8 AM – 6 PM (Extended daytime coverage)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="mon_fri_6am_6pm" 
                          checked={careSchedule.includes('mon_fri_6am_6pm')}
                          onCheckedChange={() => handleCareScheduleChange('mon_fri_6am_6pm')}
                        />
                        <Label htmlFor="mon_fri_6am_6pm" className="font-normal">
                          🕕 Monday – Friday, 6 AM – 6 PM (Full daytime coverage)
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-primary" />
                      <span className="font-medium">Weekend Shifts</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="sat_sun_6am_6pm" 
                          checked={careSchedule.includes('sat_sun_6am_6pm')}
                          onCheckedChange={() => handleCareScheduleChange('sat_sun_6am_6pm')}
                        />
                        <Label htmlFor="sat_sun_6am_6pm" className="font-normal">
                          🌞 Saturday – Sunday, 6 AM – 6 PM (Weekend daytime coverage)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="sat_sun_8am_4pm" 
                          checked={careSchedule.includes('sat_sun_8am_4pm')}
                          onCheckedChange={() => handleCareScheduleChange('sat_sun_8am_4pm')}
                        />
                        <Label htmlFor="sat_sun_8am_4pm" className="font-normal">
                          ☀️ Saturday – Sunday, 8 AM – 4 PM (Weekend standard hours)
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-primary" />
                      <span className="font-medium">Evening & Overnight Shifts</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday_evening_4pm_6am" 
                          checked={careSchedule.includes('weekday_evening_4pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_4pm_6am')}
                        />
                        <Label htmlFor="weekday_evening_4pm_6am" className="font-normal">
                          🌙 Weekday Evening Shift (4 PM – 6 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday_evening_4pm_8am" 
                          checked={careSchedule.includes('weekday_evening_4pm_8am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_4pm_8am')}
                        />
                        <Label htmlFor="weekday_evening_4pm_8am" className="font-normal">
                          🌙 Weekday Evening Shift (4 PM – 8 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday_evening_5pm_5am" 
                          checked={careSchedule.includes('weekday_evening_5pm_5am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_5pm_5am')}
                        />
                        <Label htmlFor="weekday_evening_5pm_5am" className="font-normal">
                          🌙 Weekday Evening Shift (5 PM – 5 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday_evening_5pm_8am" 
                          checked={careSchedule.includes('weekday_evening_5pm_8am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_5pm_8am')}
                        />
                        <Label htmlFor="weekday_evening_5pm_8am" className="font-normal">
                          🌙 Weekday Evening Shift (5 PM – 8 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday_evening_6pm_6am" 
                          checked={careSchedule.includes('weekday_evening_6pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_6pm_6am')}
                        />
                        <Label htmlFor="weekday_evening_6pm_6am" className="font-normal">
                          🌙 Weekday Evening Shift (6 PM – 6 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday_evening_6pm_8am" 
                          checked={careSchedule.includes('weekday_evening_6pm_8am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_6pm_8am')}
                        />
                        <Label htmlFor="weekday_evening_6pm_8am" className="font-normal">
                          🌙 Weekday Evening Shift (6 PM – 8 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend_evening_4pm_6am" 
                          checked={careSchedule.includes('weekend_evening_4pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekend_evening_4pm_6am')}
                        />
                        <Label htmlFor="weekend_evening_4pm_6am" className="font-normal">
                          🌆 Weekend Evening Shift (4 PM – 6 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend_evening_6pm_6am" 
                          checked={careSchedule.includes('weekend_evening_6pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekend_evening_6pm_6am')}
                        />
                        <Label htmlFor="weekend_evening_6pm_6am" className="font-normal">
                          🌆 Weekend Evening Shift (6 PM – 6 AM)
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium">Extended Coverage Options</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="flexible" 
                          checked={careSchedule.includes('flexible')}
                          onCheckedChange={() => handleCareScheduleChange('flexible')}
                        />
                        <Label htmlFor="flexible" className="font-normal">
                          ⏳ Flexible / On-Demand Availability
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="live_in_care" 
                          checked={careSchedule.includes('live_in_care')}
                          onCheckedChange={() => handleCareScheduleChange('live_in_care')}
                        />
                        <Label htmlFor="live_in_care" className="font-normal">
                          🏡 Live-In Care (Full-time in-home support)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="24_7_care" 
                          checked={careSchedule.includes('24_7_care')}
                          onCheckedChange={() => handleCareScheduleChange('24_7_care')}
                        />
                        <Label htmlFor="24_7_care" className="font-normal">
                          🕐 24/7 Care Availability
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="around_clock_shifts" 
                          checked={careSchedule.includes('around_clock_shifts')}
                          onCheckedChange={() => handleCareScheduleChange('around_clock_shifts')}
                        />
                        <Label htmlFor="around_clock_shifts" className="font-normal">
                          🌅 Around-the-Clock Shifts (Multiple caregivers rotating)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="other" 
                          checked={careSchedule.includes('other')}
                          onCheckedChange={() => handleCareScheduleChange('other')}
                        />
                        <Label htmlFor="other" className="font-normal">
                          ✏️ Other (Custom shift — specify your hours)
                        </Label>
                      </div>
                      
                      {careSchedule.includes('other') && (
                        <div className="pt-2 pl-6">
                          <Label htmlFor="customAvailability" className="text-sm mb-1 block">Please specify your custom availability:</Label>
                          <Textarea
                            id="customAvailability"
                            placeholder="Describe your specific availability"
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

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Preferred Hourly Rate</Label>
                <Input 
                  id="hourlyRate" 
                  placeholder="e.g., $25/hour or Negotiable" 
                  value={hourlyRate} 
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportation">Transportation</Label>
                <Select value={transportation} onValueChange={setTransportation}>
                  <SelectTrigger id="transportation">
                    <SelectValue placeholder="Do you have reliable transportation?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Own vehicle">Own vehicle</SelectItem>
                    <SelectItem value="Public transportation">Public transportation</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                    <SelectItem value="Need assistance">Need assistance with transportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;
