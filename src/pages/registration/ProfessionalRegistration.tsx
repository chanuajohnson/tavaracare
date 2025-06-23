import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/components/providers/AuthProvider';
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
import { Calendar, Sun, Moon, Clock, Loader2 } from "lucide-react";
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '../../utils/chat/prefillReader';
import { clearChatSessionData } from '../../utils/chat/chatSessionUtils';
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";

// Import standardized shift options from chat registration flows
import { STANDARDIZED_SHIFT_OPTIONS } from '../../data/chatRegistrationFlows';

const ProfessionalRegistration = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [professionalType, setProfessionalType] = useState('');
  const [otherProfessionalType, setOtherProfessionalType] = useState('');
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
  const [additionalNotes, setAdditionalNotes] = useState(''); // Changed from additionalInfo to additionalNotes
  
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [userDataPopulated, setUserDataPopulated] = useState(false);
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

  // Add availability redirect detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldScrollToAvailability = urlParams.get('scroll') === 'availability';
    const isEditMode = urlParams.get('edit') === 'true';
    
    if (shouldScrollToAvailability && isEditMode) {
      // Scroll to availability section after component mounts
      setTimeout(() => {
        const availabilitySection = document.getElementById('availability-section');
        if (availabilitySection) {
          availabilitySection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500); // Small delay to ensure DOM is ready
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

  // Pre-populate user data from auth context or database
  useEffect(() => {
    if (user && !userDataPopulated) {
      console.log('Pre-populating user data:', user);
      
      // Check if this is edit mode from dashboard
      const urlParams = new URLSearchParams(window.location.search);
      const isEditMode = urlParams.get('edit') === 'true';
      
      if (isEditMode) {
        // In edit mode, fetch complete profile data from database
        fetchCompleteProfileData();
      } else {
        // Regular registration, use auth metadata
        populateFromAuthMetadata();
      }
      
      console.log('User data population initiated');
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
        setAddress(value);
        break;
      case 'professional_type':
        setProfessionalType(value);
        break;
      case 'other_professional_type':
        setOtherProfessionalType(value);
        break;
      case 'years_of_experience':
        setYearsOfExperience(value);
        break;
      case 'hourly_rate':
        setHourlyRate(value);
        break;
      case 'transportation':
      case 'commute_mode': // Handle both field names for backward compatibility
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
      case 'additional_notes': // Changed from additional_info to additional_notes
        setAdditionalNotes(value);
        break;
      case 'custom_schedule': // Added mapping for custom_schedule
        setCustomAvailability(value);
        break;
      default:
        // Handle array fields - Updated to handle both specialties and care_services mapping
        if ((field === 'specialties' || field === 'care_services') && Array.isArray(value)) {
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

  // Add these functions at line 216 (before handleCareScheduleChange)
  const fetchCompleteProfileData = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (profile) {
        // Pre-fill all form fields with database data
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setPhoneNumber(profile.phone_number || '');
        setAddress(profile.address || '');
        setProfessionalType(profile.professional_type || '');
        // Handle other professional type - if professional_type doesn't match predefined values, it's likely a custom "other" type
        const predefinedTypes = ['agency', 'nurse', 'hha', 'cna', 'special_needs', 'therapist', 'nutritionist', 'medication', 'elderly', 'holistic', 'gapp'];
        if (profile.professional_type && !predefinedTypes.includes(profile.professional_type)) {
          setProfessionalType('other');
          setOtherProfessionalType(profile.professional_type);
        }
        setYearsOfExperience(profile.years_of_experience || '');
        setSpecialties(profile.care_services || []);
        setCertifications(profile.certifications || []);
        setCareSchedule(profile.care_schedule ? profile.care_schedule.split(',') : []);
        setCustomAvailability(profile.custom_schedule || '');
        setPreferredLocations(profile.preferred_work_locations || '');
        setHourlyRate(profile.hourly_rate || '');
        setTransportation(profile.commute_mode || '');
        setLanguages(profile.languages || []);
        setEmergencyContact(profile.emergency_contact || '');
        setBackgroundCheck(profile.background_check ? 'yes' : '');
        setAdditionalNotes(profile.additional_notes || '');
        setAvatarUrl(profile.avatar_url || null);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Fall back to auth metadata if database fetch fails
      populateFromAuthMetadata();
    } finally {
      setUserDataPopulated(true);
    }
  };

  const populateFromAuthMetadata = () => {
    // Extract email
    if (user.email) {
      setEmail(user.email);
    }
    
    // Extract names from metadata
    if (user.user_metadata) {
      const metadata = user.user_metadata;
      
      // Try different possible field names for first name
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
      
      // If we have a full_name but no separate first/last, try to split it
      if (!firstName && !lastName && metadata.full_name) {
        const nameParts = metadata.full_name.split(' ');
        if (nameParts.length >= 2) {
          setFirstName(nameParts[0]);
          setLastName(nameParts.slice(1).join(' '));
        }
      }
    }
    
    setUserDataPopulated(true);
  };

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
      if (!user?.id) {
        throw new Error('User ID is missing. Please sign in again.');
      }
      
      if (!firstName || !lastName || !phoneNumber || !address || !professionalType || !yearsOfExperience) {
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
      const finalProfessionalType = professionalType === 'other' ? otherProfessionalType : professionalType;
      
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        phone_number: phoneNumber,
        address: address,
        role: 'professional' as const,
        updated_at: new Date().toISOString(),
        professional_type: finalProfessionalType,
        years_of_experience: yearsOfExperience,
        care_services: specialties || [], // Updated: Map specialties to care_services column
        certifications: certifications || [],
        care_schedule: careSchedule.join(',') || '', // Changed to match family registration format
        custom_schedule: customAvailability || '', // Changed from custom_availability to custom_schedule
        preferred_work_locations: preferredLocations || '',
        hourly_rate: hourlyRate || '',
        commute_mode: transportation || '', // Updated: Map transportation to commute_mode column
        languages: languages || [],
        emergency_contact: emergencyContact || '',
        background_check: backgroundCheck ? backgroundCheck === 'yes' || backgroundCheck === 'true' : null,
        additional_notes: additionalNotes || '' // Changed from additional_info to additional_notes
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

      toast.success('Registration Complete! Your professional caregiver registration has been updated.');
      navigate('/dashboard/professional');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show auth required state if no user
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
                <Label htmlFor="professional-type" className="mb-1">Professional Role <span className="text-red-500">*</span></Label>
                <Select value={professionalType} onValueChange={setProfessionalType} required>
                  <SelectTrigger id="professional-type">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agency">👨‍👦 Professional Agency</SelectItem>
                    <SelectItem value="nurse">🏥 Licensed Nurse (LPN/RN/BSN)</SelectItem>
                    <SelectItem value="hha">🏠 Home Health Aide (HHA)</SelectItem>
                    <SelectItem value="cna">👩‍⚕️ Certified Nursing Assistant (CNA)</SelectItem>
                    <SelectItem value="special_needs">🧠 Special Needs Caregiver</SelectItem>
                    <SelectItem value="therapist">🏋️ Physical / Occupational Therapist</SelectItem>
                    <SelectItem value="nutritionist">🍽️ Nutritional & Dietary Specialist</SelectItem>
                    <SelectItem value="medication">💊 Medication Management Expert</SelectItem>
                    <SelectItem value="elderly">👨‍🦽 Elderly & Mobility Support</SelectItem>
                    <SelectItem value="holistic">🌱 Holistic Care & Wellness</SelectItem>
                    <SelectItem value="gapp">👨‍👦 The Geriatric Adolescent Partnership Programme (GAPP)</SelectItem>
                    <SelectItem value="other">⚕️ Other (Please specify)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {professionalType === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="other-professional-type" className="mb-1">Specify Professional Role <span className="text-red-500">*</span></Label>
                  <Input
                    id="other-professional-type"
                    placeholder="Specify your professional role"
                    value={otherProfessionalType}
                    onChange={(e) => setOtherProfessionalType(e.target.value)}
                    required={professionalType === 'other'}
                  />
                </div>
              )}

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
                    { id: 'specialty-household', label: '🧹 Household Assistance', value: 'Household Assistance' }
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

          <Card className="mb-8" id="availability-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                📅 Availability & Schedule Preferences
              </CardTitle>
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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Any additional notes about your experience or preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea 
                  id="additionalNotes" 
                  placeholder="Any additional information about your experience, preferences, or availability" 
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
