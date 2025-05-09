import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase, ensureStorageBuckets, ensureAuthContext } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';
import { Calendar, Sun, Moon, Clock, Home } from "lucide-react";
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '../../utils/chat/prefillReader';
import { clearChatSessionData } from '../../utils/chat/chatSessionUtils';

const FamilyRegistration = () => {
  const [loading, setLoading] = useState(false);
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
  const [otherSpecialNeeds, setOtherSpecialNeeds] = useState('');
  const [specializedCare, setSpecializedCare] = useState<string[]>([]);
  
  const [caregiverType, setCaregiverType] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [careSchedule, setCareSchedule] = useState<string[]>([]);
  const [customSchedule, setCustomSchedule] = useState('');
  const [caregiverPreferences, setCaregiverPreferences] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [budgetPreferences, setBudgetPreferences] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
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

  // Function to set form field values from prefill data
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
      case 'budget':
        setBudgetPreferences(value);
        break;
      case 'care_recipient_name':
        setCareRecipientName(value);
        break;
      case 'relationship':
        setRelationship(value);
        break;
      case 'caregiver_type':
        setCaregiverType(value);
        break;
      case 'preferred_contact_method':
        setPreferredContactMethod(value);
        break;
      case 'emergency_contact':
        setEmergencyContact(value);
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
        } else if (field === 'specialized_care' && Array.isArray(value)) {
          setSpecializedCare(value);
        } else if (field === 'care_schedule' && Array.isArray(value)) {
          setCareSchedule(value);
        }
        break;
    }
  };

  // Apply prefill data when available
  useEffect(() => {
    // Only try to apply prefill once
    if (!prefillApplied) {
      console.log('Checking for prefill data...');
      
      // Try to apply prefill data from URL and localStorage
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
        
        // If we should auto-submit and we have prefill data and a logged-in user, submit the form
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

  useEffect(() => {
    ensureStorageBuckets().catch(err => {
      console.error('Failed to check storage buckets:', err);
    });
    
    const getUser = async () => {
      try {
        await ensureAuthContext();
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          toast.error('Authentication error. Please sign in again.');
          navigate('/auth');
          return;
        }
        
        if (!sessionData.session) {
          console.log('No active session found');
          toast.error('Please sign in to complete your registration.');
          navigate('/auth');
          return;
        }
        
        setAuthSession(sessionData.session);
        
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData?.user) {
          console.error('Error fetching user:', userError);
          toast.error('Authentication error. Please sign in again.');
          navigate('/auth');
          return;
        }
        
        setUser(userData.user);
        setEmail(userData.user.email || '');
        
        try {
          console.log('Fetching profile for user ID:', userData.user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            await createBasicProfile(userData.user.id);
            return;
          }

          if (profileData) {
            console.log('Profile data found:', profileData);
            setAvatarUrl(profileData.avatar_url);
            setFirstName(profileData.full_name?.split(' ')[0] || '');
            setLastName(profileData.full_name?.split(' ')[1] || '');
            setPhoneNumber(profileData.phone_number || '');
            setAddress(profileData.address || '');
            setCareRecipientName(profileData.care_recipient_name || '');
            setRelationship(profileData.relationship || '');
            setCareTypes(profileData.care_types || []);
            setSpecialNeeds(profileData.special_needs || []);
            setSpecializedCare(profileData.specialized_care || []);
            setOtherSpecialNeeds(profileData.other_special_needs || '');
            setCaregiverType(profileData.caregiver_type || '');
            setPreferredContactMethod(profileData.preferred_contact_method || '');
            setCareSchedule(profileData.care_schedule ? 
              (typeof profileData.care_schedule === 'string' ? 
                [profileData.care_schedule] : 
                profileData.care_schedule) : 
              []);
            setCustomSchedule(profileData.custom_schedule || '');
            setBudgetPreferences(profileData.budget_preferences || '');
            setCaregiverPreferences(profileData.caregiver_preferences || '');
            setEmergencyContact(profileData.emergency_contact || '');
            setAdditionalNotes(profileData.additional_notes || '');
          } else {
            console.log('No profile found, creating basic profile');
            await createBasicProfile(userData.user.id);
          }
        } catch (profileErr) {
          console.error('Error in profile fetch:', profileErr);
          await createBasicProfile(userData.user.id);
        }
      } catch (err) {
        console.error('Error in authentication flow:', err);
        toast.error('Authentication error. Please sign in again.');
        navigate('/auth');
      }
    };

    const createBasicProfile = async (userId: string) => {
      try {
        console.log('Creating basic profile for user:', userId);
        const { data: { user } } = await supabase.auth.getUser();
        
        let fullName = '';
        if (user?.user_metadata?.full_name) {
          fullName = user.user_metadata.full_name;
        } else if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
          fullName = `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
        } else if (user?.email) {
          fullName = user.email.split('@')[0];
        }
        
        await ensureAuthContext();
        
        const { error } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          role: 'family',
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          console.error('Error creating basic profile:', error);
          throw error;
        }
        
        console.log('Basic profile created successfully');
        
        if (fullName) {
          const nameParts = fullName.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }
        
        if (user?.email) {
          setEmail(user.email);
        }
        
      } catch (err) {
        console.error('Failed to create basic profile:', err);
        toast.error('Failed to create user profile. Please try again or contact support.');
      }
    };

    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (session) {
        setAuthSession(session);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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

  const updateProfile = async (profileData) => {
    try {
      // Convert care_schedule from string[] to string if needed
      const updatedProfileData = {
        ...profileData,
        // If care_schedule is an array, join it into a string
        care_schedule: Array.isArray(profileData.care_schedule) 
          ? profileData.care_schedule.join(', ')
          : profileData.care_schedule
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Success handling
    } catch (err) {
      // Error handling
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
      
      console.log('Current user ID for profile update:', user?.id);
      
      if (!user?.id) {
        throw new Error('User ID is missing. Please sign in again.');
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
        role: 'family',
        updated_at: new Date().toISOString(),
        care_recipient_name: careRecipientName,
        relationship: relationship,
        care_types: careTypes || [],
        special_needs: specialNeeds || [],
        specialized_care: specializedCare || [],
        other_special_needs: otherSpecialNeeds || '',
        caregiver_type: caregiverType || '',
        preferred_contact_method: preferredContactMethod || '',
        care_schedule: careSchedule || [],
        custom_schedule: customSchedule || '',
        budget_preferences: budgetPreferences || '',
        caregiver_preferences: caregiverPreferences || '',
        emergency_contact: emergencyContact || '',
        additional_notes: additionalNotes || ''
      };

      console.log('Updating profile with data:', updates);
      
      await updateProfile(updates);
      
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

      toast.success('Registration Complete! Your family caregiver profile has been updated.');
      
      navigate('/dashboard/family');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Family Member Registration</h1>
      <p className="text-gray-500 mb-8">
        Complete your profile to connect with professional caregivers and community resources.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal & Contact Information</CardTitle>
            <CardDescription>
              Tell us about yourself so we can connect you with the right care providers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" />
                ) : (
                  <AvatarFallback>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <Label htmlFor="avatar" className="cursor-pointer text-primary">
                {avatarUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </Label>
            </div>
            
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
              <Label htmlFor="address">Location – Address/City of the care recipient *</Label>
              <Input 
                id="address" 
                placeholder="Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Care Recipient Information</CardTitle>
            <CardDescription>
              Tell us about the person you are caring for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="careRecipientName">Care Recipient's Full Name – Name of the person needing care *</Label>
              <Input 
                id="careRecipientName" 
                placeholder="Care Recipient Name" 
                value={careRecipientName} 
                onChange={(e) => setCareRecipientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship to Care Recipient *</Label>
              <Select value={relationship} onValueChange={setRelationship} required>
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="Select your relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Grandparent">Grandparent</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Care Type Needed ��� What type of care is needed? (Select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'care-inhome', label: '🏠 In-Home Care (Daily, Nighttime, Weekend, Live-in)', value: 'In-Home Care' },
                  { id: 'care-medical', label: '🏥 Medical Support (Post-surgery, Chronic Condition Management, Hospice)', value: 'Medical Support' },
                  { id: 'care-therapeutic', label: '🌱 Therapeutic Support (Physical Therapy, Occupational Therapy, Speech Therapy)', value: 'Therapeutic Support' },
                  { id: 'care-specialneeds', label: '🎓 Child or Special Needs Support (Autism, ADHD, Learning Disabilities)', value: 'Special Needs Support' },
                  { id: 'care-cognitive', label: '🧠 Cognitive & Memory Care (Alzheimer\'s, Dementia, Parkinson\'s)', value: 'Cognitive & Memory Care' },
                  { id: 'care-mobility', label: '♿ Mobility Assistance (Wheelchair, Bed-bound, Fall Prevention)', value: 'Mobility Assistance' },
                  { id: 'care-medication', label: '💊 Medication Management (Daily Medications, Insulin, Medical Equipment)', value: 'Medication Management' },
                  { id: 'care-nutrition', label: '🍽️ Nutritional Assistance (Meal Prep, Special Diets, Tube Feeding)', value: 'Nutritional Assistance' },
                  { id: 'care-household', label: '🏡 Household Assistance (Cleaning, Laundry, Errands, Yard/Garden Maintenance)', value: 'Household Assistance' }
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
              <Label htmlFor="caregiverType">Preferred Caregiver Type – Do you prefer care from:</Label>
              <Select value={caregiverType} onValueChange={setCaregiverType}>
                <SelectTrigger id="caregiverType">
                  <SelectValue placeholder="Select Caregiver Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certified Agency">🏥 Certified Agency</SelectItem>
                  <SelectItem value="Independent Caregiver">🏠 Independent Caregiver</SelectItem>
                  <SelectItem value="Either">👩‍⚕️ Either is fine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🟡 Special Medical & Care Needs (Required If Applicable)</CardTitle>
            <CardDescription>
              Detailed information about specific medical conditions and care requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Does the Care Recipient Have Any of These Conditions? (Check all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'needs-cognitive', label: '🧠 Cognitive Disorders – Alzheimer\'s, Dementia, Parkinson\'s', value: 'Cognitive Disorders' },
                  { id: 'needs-physical', label: '♿ Physical Disabilities – Stroke, Paralysis, ALS, Multiple Sclerosis', value: 'Physical Disabilities' },
                  { id: 'needs-chronic', label: '🏥 Chronic Illness – Diabetes, Heart Disease, Cancer, Kidney Disease', value: 'Chronic Illness' },
                  { id: 'needs-specialneeds', label: '🧩 Special Needs (Child or Adult) – Autism, Down Syndrome, Cerebral Palsy, ADHD', value: 'Special Needs' },
                  { id: 'needs-equipment', label: '💊 Medical Equipment Use – Oxygen Tank, Ventilator, Catheter, Feeding Tube', value: 'Medical Equipment Use' },
                  { id: 'needs-vision', label: '👁️ Vision or Hearing Impairment', value: 'Vision or Hearing Impairment' }
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

            <div className="space-y-2">
              <Label htmlFor="otherSpecialNeeds">⚠️ Other Special Needs (if any)</Label>
              <Textarea 
                id="otherSpecialNeeds" 
                placeholder="Please specify any other special needs" 
                value={otherSpecialNeeds} 
                onChange={(e) => setOtherSpecialNeeds(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Specialized Care Requirements – Do they need:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: 'specialized-supervision', label: '🏥 24/7 Supervision', value: '24/7 Supervision' },
                  { id: 'specialized-nurse', label: '🩺 Nurse-Level Medical Assistance', value: 'Nurse-Level Medical Assistance' },
                  { id: 'specialized-diet', label: '🍽️ Special Diet/Nutritional Needs', value: 'Special Diet/Nutritional Needs' },
                  { id: 'specialized-transport', label: '🚗 Transportation to Appointments', value: 'Transportation to Appointments' },
                  { id: 'specialized-language', label: '💬 Sign Language/Language-Specific Care', value: 'Sign Language/Language-Specific Care' }
                ].map((item) => (
                  <div key={item.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={item.id} 
                      checked={specializedCare.includes(item.value)}
                      onCheckedChange={() => handleCheckboxArrayChange(
                        item.value, 
                        specializedCare, 
                        setSpecializedCare
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
            <CardTitle>🟡 Additional Preferences (Optional but Recommended)</CardTitle>
            <CardDescription>
              Help us better understand your specific needs and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Care Schedule & Availability – Preferred care hours</Label>
              <p className="text-sm text-gray-500 mb-4">Select the care schedule options that best fit your needs. This helps us match you with caregivers who have matching availability.</p>
              
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
                        checked={careSchedule.includes('weekday_standard')}
                        onCheckedChange={() => handleCareScheduleChange('weekday_standard')}
                      />
                      <Label htmlFor="weekday-standard" className="font-normal">
                        ☀️ Monday – Friday, 8 AM – 4 PM (Standard daytime coverage)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="weekday-extended" 
                        checked={careSchedule.includes('weekday_extended')}
                        onCheckedChange={() => handleCareScheduleChange('weekday_extended')}
                      />
                      <Label htmlFor="weekday-extended" className="font-normal">
                        🕕 Monday – Friday, 8 AM – 6 PM (Extended evening coverage)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="weekday-full" 
                        checked={careSchedule.includes('weekday_full')}
                        onCheckedChange={() => handleCareScheduleChange('weekday_full')}
                      />
                      <Label htmlFor="weekday-full" className="font-normal">
                        🕕 Monday – Friday, 6 AM – 6 PM (Full daytime coverage)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="weekday-night" 
                        checked={careSchedule.includes('weekday_night')}
                        onCheckedChange={() => handleCareScheduleChange('weekday_night')}
                      />
                      <Label htmlFor="weekday-night" className="font-normal">
                        🌙 Monday – Friday, 6 PM – 8 AM (Nighttime coverage)
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
                        id="weekend-standard" 
                        checked={careSchedule.includes('weekend_standard')}
                        onCheckedChange={() => handleCareScheduleChange('weekend_standard')}
                      />
                      <Label htmlFor="weekend-standard" className="font-normal">
                        🌞 Saturday – Sunday, 8 AM – 6 PM (Daytime weekend coverage)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="weekend-day" 
                        checked={careSchedule.includes('weekend_day')}
                        onCheckedChange={() => handleCareScheduleChange('weekend_day')}
                      />
                      <Label htmlFor="weekend-day" className="font-normal">
                        🌞 Saturday – Sunday, 6 AM – 6 PM (Full daytime weekend coverage)
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
                        checked={careSchedule.includes('evening_4_6')}
                        onCheckedChange={() => handleCareScheduleChange('evening_4_6')}
                      />
                      <Label htmlFor="evening-4-6" className="font-normal">
                        🌙 Weekday Evening Shift (4 PM – 6 AM)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="evening-4-8" 
                        checked={careSchedule.includes('evening_4_8')}
                        onCheckedChange={() => handleCareScheduleChange('evening_4_8')}
                      />
                      <Label htmlFor="evening-4-8" className="font-normal">
                        🌙 Weekday Evening Shift (4 PM – 8 AM)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="evening-6-6" 
                        checked={careSchedule.includes('evening_6_6')}
                        onCheckedChange={() => handleCareScheduleChange('evening_6_6')}
                      />
                      <Label htmlFor="evening-6-6" className="font-normal">
                        🌙 Weekday Evening Shift (6 PM – 6 AM)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="evening-6-8" 
                        checked={careSchedule.includes('evening_6_8')}
                        onCheckedChange={() => handleCareScheduleChange('evening_6_8')}
                      />
                      <Label htmlFor="evening-6-8" className="font-normal">
                        🌙 Weekday Evening Shift (6 PM – 8 AM)
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
                        checked={careSchedule.includes('live_in')}
                        onCheckedChange={() => handleCareScheduleChange('live_in')}
                      />
                      <Label htmlFor="live-in" className="font-normal">
                        🏡 Live-In Care (Full-time in-home support)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="custom" 
                        checked={careSchedule.includes('custom')}
                        onCheckedChange={() => handleCareScheduleChange('custom')}
                      />
                      <Label htmlFor="custom" className="font-normal">
                        ✏️ Other (Custom shift — specify your hours)
                      </Label>
                    </div>
                    
                    {careSchedule.includes('custom') && (
                      <div className="pt-2 pl-6">
                        <Label htmlFor="customSchedule" className="text-sm mb-1 block">Please specify your custom schedule:</Label>
                        <Textarea
                          id="customSchedule"
                          placeholder="Describe your specific schedule needs"
                          value={customSchedule}
                          onChange={(e) => setCustomSchedule(e.target.value)}
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
              <Label htmlFor="caregiverPreferences">Caregiver Preferences – Gender, Age, Language, Experience Level</Label>
              <Textarea 
                id="caregiverPreferences" 
                placeholder="Please specify any preferences regarding your caregiver" 
                value={caregiverPreferences} 
                onChange={(e) => setCaregiverPreferences(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Details – Secondary contact in case of urgent needs</Label>
              <Input 
                id="emergencyContact" 
                placeholder="Name, relationship, phone number" 
                value={emergencyContact} 
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPreferences">Budget Preferences – Expected hourly or monthly care budget</Label>
              <Input 
                id="budgetPreferences" 
                placeholder="Your budget for care services" 
                value={budgetPreferences} 
                onChange={(e) => setBudgetPreferences(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select value={preferredContactMethod} onValueChange={setPreferredContactMethod}>
                <SelectTrigger id="preferredContactMethod">
                  <SelectValue placeholder="Select Contact Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea 
                id="additionalNotes" 
                placeholder="Any other information you would like to share" 
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
            {loading ? 'Submitting...' : 'Complete Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FamilyRegistration;
