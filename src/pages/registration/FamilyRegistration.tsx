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
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from 'sonner';
import { Calendar, Sun, Moon, Clock } from "lucide-react";
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '../../utils/chat/prefillReader';
import { clearChatSessionData } from '../../utils/chat/chatSessionUtils';
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";

const FamilyRegistration = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [careRecipientName, setCareRecipientName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [careSchedule, setCareSchedule] = useState<string[]>([]);
  const [customCareSchedule, setCustomCareSchedule] = useState('');
  const [budget, setBudget] = useState('');
  const [caregiverType, setCaregiverType] = useState('');
  const [caregiverPreferences, setCaregiverPreferences] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);
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

  // Load existing profile data when user is available
  const loadExistingProfile = async (userId: string) => {
    if (profileDataLoaded) return; // Prevent duplicate loads
    
    setProfileLoading(true);
    console.log('Loading existing profile data for user:', userId);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('role', 'family')
        .maybeSingle();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      if (profile) {
        console.log('Found existing profile data:', profile);
        
        // Prefill basic contact info
        if (profile.phone_number) setPhoneNumber(profile.phone_number);
        if (profile.address) setAddress(profile.address);
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        
        // Prefill care recipient info
        if (profile.care_recipient_name) setCareRecipientName(profile.care_recipient_name);
        if (profile.relationship) setRelationship(profile.relationship);
        
        // Prefill care types (handle as array)
        if (profile.care_types && Array.isArray(profile.care_types)) {
          setCareTypes(profile.care_types);
        }
        
        // Prefill special needs (handle as array)
        if (profile.special_needs && Array.isArray(profile.special_needs)) {
          setSpecialNeeds(profile.special_needs);
        }
        
        // Prefill care schedule (parse from comma-separated string or array)
        if (profile.care_schedule) {
          if (typeof profile.care_schedule === 'string') {
            setCareSchedule(profile.care_schedule.split(',').filter(s => s.trim()));
          } else if (Array.isArray(profile.care_schedule)) {
            setCareSchedule(profile.care_schedule);
          }
        }
        
        // Prefill custom schedule
        if (profile.custom_schedule) setCustomCareSchedule(profile.custom_schedule);
        
        // Prefill preferences and notes
        if (profile.budget_preferences) setBudget(profile.budget_preferences);
        if (profile.caregiver_type) setCaregiverType(profile.caregiver_type);
        if (profile.caregiver_preferences) setCaregiverPreferences(profile.caregiver_preferences);
        if (profile.additional_notes) setAdditionalNotes(profile.additional_notes);
        if (profile.preferred_contact_method) setPreferredContactMethod(profile.preferred_contact_method);
        
        setProfileDataLoaded(true);
        toast.success('Profile data loaded for editing');
      } else {
        console.log('No existing profile found - new registration');
        setProfileDataLoaded(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Load existing profile data when user is available
  useEffect(() => {
    if (user && !profileDataLoaded && !profileLoading) {
      loadExistingProfile(user.id);
    }
  }, [user, profileDataLoaded, profileLoading]);

  // Pre-populate form fields when user auth data is available
  useEffect(() => {
    if (user && !prefillApplied) {
      console.log('Pre-populating form with user data:', {
        email: user.email,
        metadata: user.user_metadata
      });
      
      // Set email from authenticated user
      if (user.email) {
        setEmail(user.email);
      }
      
      // Extract name information from user metadata (only if not already set from profile)
      if (user.user_metadata && !firstName && !lastName) {
        const metadata = user.user_metadata;
        
        // Try different possible metadata keys for first/last name
        const possibleFirstNames = ['first_name', 'firstName', 'given_name'];
        const possibleLastNames = ['last_name', 'lastName', 'family_name', 'surname'];
        
        for (const key of possibleFirstNames) {
          if (metadata[key] && !firstName) {
            setFirstName(metadata[key]);
            console.log(`Set first name from ${key}:`, metadata[key]);
            break;
          }
        }
        
        for (const key of possibleLastNames) {
          if (metadata[key] && !lastName) {
            setLastName(metadata[key]);
            console.log(`Set last name from ${key}:`, metadata[key]);
            break;
          }
        }
        
        // If full_name is available but first/last aren't, try to split it
        if (metadata.full_name && !firstName && !lastName) {
          const nameParts = metadata.full_name.split(' ');
          if (nameParts.length >= 2) {
            setFirstName(nameParts[0]);
            setLastName(nameParts.slice(1).join(' '));
            console.log('Split full name:', metadata.full_name);
          }
        }
      }
    }
  }, [user, prefillApplied, firstName, lastName]);

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
      case 'address':
        setAddress(value);
        break;
      case 'care_recipient_name':
        setCareRecipientName(value);
        break;
      case 'relationship':
        setRelationship(value);
        break;
      case 'budget_preferences':
        setBudget(value);
        break;
      case 'caregiver_type':
        setCaregiverType(value);
        break;
      case 'caregiver_preferences':
        setCaregiverPreferences(value);
        break;
      case 'preferred_contact_method':
        setPreferredContactMethod(value);
        break;
      case 'additional_notes':
        setAdditionalNotes(value);
        break;
      default:
        // Handle array fields
        if (field === 'care_types' && Array.isArray(value)) {
          setCareTypes(value);
        } else if (field === 'special_needs' && Array.isArray(value)) {
          setSpecialNeeds(value);
        } else if (field === 'care_schedule' && Array.isArray(value)) {
          setCareSchedule(value);
        }
        break;
    }
  };

  // Apply prefill data when available (for new registrations from chat)
  useEffect(() => {
    if (!prefillApplied && user && profileDataLoaded) {
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
  }, [prefillApplied, shouldAutoSubmit, user, profileDataLoaded]);

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
        toast.error('Authentication required. Please sign in again.');
        navigate('/auth');
        return;
      }
      
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
      
      if (!firstName || !lastName || !phoneNumber || !address || !careRecipientName || !relationship) {
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
        role: 'family' as const,
        updated_at: new Date().toISOString(),
        care_recipient_name: careRecipientName,
        relationship: relationship,
        care_types: careTypes || [],
        special_needs: specialNeeds || [],
        care_schedule: careSchedule.length > 0 ? careSchedule.join(',') : '',
        custom_schedule: customCareSchedule || '',
        budget_preferences: budget || '',
        caregiver_type: caregiverType || '',
        caregiver_preferences: caregiverPreferences || '',
        additional_notes: additionalNotes || '',
        preferred_contact_method: preferredContactMethod || ''
      };

      console.log('Updating family profile with data:', updates);
      
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

      toast.success('Registration Complete! Your family profile has been updated.');
      
      navigate('/dashboard/family');
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Show auth required message if no user after loading
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to complete your family registration.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  // Show loading state while profile data is being loaded
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading your profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageViewTracker 
        actionType="family_registration_page_view" 
        journeyStage="registration"
      />
      
      <DashboardHeader 
        breadcrumbItems={[
          { label: "Family Dashboard", path: "/dashboard/family" },
          { label: "Family Registration", path: "/registration/family" }
        ]} 
      />
      
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">Family Care Registration</h1>
        <p className="text-gray-500 mb-8">
          Complete your family profile to find the right caregiver for your loved one.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Personal & Contact Information</CardTitle>
              <CardDescription>
                Tell us about yourself so caregivers can learn about your family.
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
                <Label htmlFor="address">Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="Your full address" 
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
              <CardTitle>Care Recipient Information</CardTitle>
              <CardDescription>
                Tell us about the person who needs care.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careRecipientName">Care Recipient's Name *</Label>
                <Input 
                  id="careRecipientName" 
                  placeholder="Full Name" 
                  value={careRecipientName} 
                  onChange={(e) => setCareRecipientName(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to Care Recipient *</Label>
                <Select value={relationship} onValueChange={setRelationship} required>
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="spouse">Spouse/Partner</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Care Needs & Preferences</CardTitle>
              <CardDescription>
                Share the types of care assistance needed and any special needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Care Types – What type of care assistance do you need? (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'personal_care', label: '🧼 Personal Care (bathing, dressing, toileting)', value: 'personal_care' },
                    { id: 'medication_management', label: '💊 Medication Management', value: 'medication_management' },
                    { id: 'mobility_assistance', label: '🚶 Mobility Assistance', value: 'mobility_assistance' },
                    { id: 'meal_preparation', label: '🍲 Meal Preparation', value: 'meal_preparation' },
                    { id: 'housekeeping', label: '🧹 Light Housekeeping', value: 'housekeeping' },
                    { id: 'transportation', label: '🚗 Transportation', value: 'transportation' },
                    { id: 'companionship', label: '👥 Companionship', value: 'companionship' },
                    { id: 'specialized_care', label: '🏥 Specialized Medical Care', value: 'specialized_care' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={careTypes.includes(item.value)}
                        onCheckedChange={() => handleCheckboxArrayChange(
                          item.value, 
                          careTypes, 
                          setCareTypes
                        )}
                        className="mt-1"
                      />
                      <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Needs or Conditions (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: 'dementia', label: "🧠 Dementia/Alzheimer's", value: 'dementia' },
                    { id: 'parkinsons', label: "🤲 Parkinson's Disease", value: 'parkinsons' },
                    { id: 'diabetes', label: "🩸 Diabetes", value: 'diabetes' },
                    { id: 'stroke_recovery', label: "🫀 Stroke Recovery", value: 'stroke_recovery' },
                    { id: 'cancer_care', label: "🎗️ Cancer Care", value: 'cancer_care' },
                    { id: 'heart_disease', label: "❤️ Heart Disease", value: 'heart_disease' },
                    { id: 'respiratory_issues', label: "🫁 Respiratory Issues", value: 'respiratory_issues' },
                    { id: 'mobility_limitations', label: "♿ Mobility Limitations", value: 'mobility_limitations' },
                    { id: 'wound_care', label: "🩹 Wound Care", value: 'wound_care' },
                    { id: 'incontinence', label: "💧 Incontinence", value: 'incontinence' },
                    { id: 'other', label: "✏️ Other (please specify)", value: 'other' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={specialNeeds.includes(item.value)}
                        onCheckedChange={() => handleCheckboxArrayChange(
                          item.value, 
                          specialNeeds, 
                          setSpecialNeeds
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
              <CardTitle>📅 Care Schedule & Availability</CardTitle>
              <CardDescription>
                When do you need care support? Select all time slots that work for your family.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Care Schedule – When do you need caregiving support?</Label>
                <p className="text-sm text-gray-500 mb-4">Select all time slots when you need care assistance. This helps us match you with caregivers who are available during these hours.</p>
                
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium">Standard Weekday Shifts</span>
                    </div>
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-standard" 
                          checked={careSchedule.includes('mon_fri_8am_4pm')}
                          onCheckedChange={() => handleCareScheduleChange('mon_fri_8am_4pm')}
                        />
                        <Label htmlFor="weekday-standard" className="font-normal">
                          ☀️ Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-extended-8-6" 
                          checked={careSchedule.includes('mon_fri_8am_6pm')}
                          onCheckedChange={() => handleCareScheduleChange('mon_fri_8am_6pm')}
                        />
                        <Label htmlFor="weekday-extended-8-6" className="font-normal">
                          🕕 Monday – Friday, 8 AM – 6 PM (Extended daytime coverage)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekday-extended-6-6" 
                          checked={careSchedule.includes('mon_fri_6am_6pm')}
                          onCheckedChange={() => handleCareScheduleChange('mon_fri_6am_6pm')}
                        />
                        <Label htmlFor="weekday-extended-6-6" className="font-normal">
                          🕕 Monday – Friday, 6 AM – 6 PM (Extended daytime coverage)
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
                          id="weekend-day" 
                          checked={careSchedule.includes('sat_sun_6am_6pm')}
                          onCheckedChange={() => handleCareScheduleChange('sat_sun_6am_6pm')}
                        />
                        <Label htmlFor="weekend-day" className="font-normal">
                          🌞 Saturday – Sunday, 6 AM – 6 PM (Weekend daytime coverage)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-standard" 
                          checked={careSchedule.includes('sat_sun_8am_4pm')}
                          onCheckedChange={() => handleCareScheduleChange('sat_sun_8am_4pm')}
                        />
                        <Label htmlFor="weekend-standard" className="font-normal">
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
                          id="evening-4-6" 
                          checked={careSchedule.includes('weekday_evening_4pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_4pm_6am')}
                        />
                        <Label htmlFor="evening-4-6" className="font-normal">
                          🌙 Weekday Evening Shift (4 PM – 6 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="evening-4-8" 
                          checked={careSchedule.includes('weekday_evening_4pm_8am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_4pm_8am')}
                        />
                        <Label htmlFor="evening-4-8" className="font-normal">
                          🌙 Weekday Evening Shift (4 PM – 8 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="evening-5-5" 
                          checked={careSchedule.includes('weekday_evening_5pm_5am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_5pm_5am')}
                        />
                        <Label htmlFor="evening-5-5" className="font-normal">
                          🌙 Weekday Evening Shift (5 PM – 5 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="evening-5-8" 
                          checked={careSchedule.includes('weekday_evening_5pm_8am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_5pm_8am')}
                        />
                        <Label htmlFor="evening-5-8" className="font-normal">
                          🌙 Weekday Evening Shift (5 PM – 8 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="evening-6-6" 
                          checked={careSchedule.includes('weekday_evening_6pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_6pm_6am')}
                        />
                        <Label htmlFor="evening-6-6" className="font-normal">
                          🌙 Weekday Evening Shift (6 PM – 6 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="evening-6-8" 
                          checked={careSchedule.includes('weekday_evening_6pm_8am')}
                          onCheckedChange={() => handleCareScheduleChange('weekday_evening_6pm_8am')}
                        />
                        <Label htmlFor="evening-6-8" className="font-normal">
                          🌙 Weekday Evening Shift (6 PM – 8 AM)
                        </Label>
                      </div>
                      
                      {/* Weekend Evening Shifts */}
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-evening-4-6" 
                          checked={careSchedule.includes('weekend_evening_4pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekend_evening_4pm_6am')}
                        />
                        <Label htmlFor="weekend-evening-4-6" className="font-normal">
                          🌆 Weekend Evening Shift (4 PM – 6 AM)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="weekend-evening-6-6" 
                          checked={careSchedule.includes('weekend_evening_6pm_6am')}
                          onCheckedChange={() => handleCareScheduleChange('weekend_evening_6pm_6am')}
                        />
                        <Label htmlFor="weekend-evening-6-6" className="font-normal">
                          🌆 Weekend Evening Shift (6 PM – 6 AM)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium">Other Options</span>
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
                          id="live-in" 
                          checked={careSchedule.includes('live_in_care')}
                          onCheckedChange={() => handleCareScheduleChange('live_in_care')}
                        />
                        <Label htmlFor="live-in" className="font-normal">
                          🏡 Live-In Care (Full-time in-home support)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="care-24-7" 
                          checked={careSchedule.includes('24_7_care')}
                          onCheckedChange={() => handleCareScheduleChange('24_7_care')}
                        />
                        <Label htmlFor="care-24-7" className="font-normal">
                          🕐 24/7 Care Availability
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="around-clock" 
                          checked={careSchedule.includes('around_clock_shifts')}
                          onCheckedChange={() => handleCareScheduleChange('around_clock_shifts')}
                        />
                        <Label htmlFor="around-clock" className="font-normal">
                          🌅 Around-the-Clock Shifts (Multiple caregivers rotating)
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox 
                          id="other-schedule" 
                          checked={careSchedule.includes('other')}
                          onCheckedChange={() => handleCareScheduleChange('other')}
                        />
                        <Label htmlFor="other-schedule" className="font-normal">
                          ✏️ Other (Custom schedule — specify your hours)
                        </Label>
                      </div>
                      
                      {careSchedule.includes('other') && (
                        <div className="pt-2 pl-6">
                          <Label htmlFor="customCareSchedule" className="text-sm mb-1 block">Please specify your custom care schedule:</Label>
                          <Textarea
                            id="customCareSchedule"
                            placeholder="Describe your specific care schedule needs"
                            value={customCareSchedule}
                            onChange={(e) => setCustomCareSchedule(e.target.value)}
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
              <CardTitle>Budget & Caregiver Preferences</CardTitle>
              <CardDescription>
                Share your budget and preferences for caregivers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_15">Under $15/hour</SelectItem>
                    <SelectItem value="15_20">$15-$20/hour</SelectItem>
                    <SelectItem value="20_25">$20-$25/hour</SelectItem>
                    <SelectItem value="25_30">$25-$30/hour</SelectItem>
                    <SelectItem value="30_plus">$30+/hour</SelectItem>
                    <SelectItem value="not_sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caregiverType">Type of Caregiver Preferred</Label>
                <Select value={caregiverType} onValueChange={setCaregiverType}>
                  <SelectTrigger id="caregiverType">
                    <SelectValue placeholder="Select caregiver type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">👩‍⚕️ Professional Caregiver (trained, experienced)</SelectItem>
                    <SelectItem value="nurse">🏥 Nurse (RN or LPN)</SelectItem>
                    <SelectItem value="companion">👥 Companion Caregiver (non-medical)</SelectItem>
                    <SelectItem value="specialized">🔬 Specialized Care Provider</SelectItem>
                    <SelectItem value="no_preference">🤷 No specific preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caregiverPreferences">Specific Preferences for Caregiver</Label>
                <Textarea 
                  id="caregiverPreferences" 
                  placeholder="Any preferences regarding language, experience, etc." 
                  value={caregiverPreferences} 
                  onChange={(e) => setCaregiverPreferences(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Anything else you'd like to share about your care needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea 
                  id="additionalNotes" 
                  placeholder="Any additional details that would help us understand your situation better" 
                  value={additionalNotes} 
                  onChange={(e) => setAdditionalNotes(e.target.value)}
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

export default FamilyRegistration;
