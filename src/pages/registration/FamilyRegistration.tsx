import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Calendar, Sun, Moon, Clock, AlertCircle } from "lucide-react";
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '../../utils/chat/prefillReader';
import { clearChatSessionData } from '../../utils/chat/chatSessionUtils';
import { setAuthFlowFlag, AUTH_FLOW_FLAGS } from "@/utils/authFlowUtils";
import { useAuth } from '@/components/providers/AuthProvider';
import { TRINIDAD_TOBAGO_LOCATIONS } from '../../constants/locations';

interface FamilyRegistrationProps {
  isDemo?: boolean;
}

const FamilyRegistration = ({ isDemo: isExternalDemo = false }: FamilyRegistrationProps = {}) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const isDemo = isExternalDemo || searchParams.get('demo') === 'true';
  
  console.log('🔍 URL and Edit Mode Debug:', {
    fullURL: window.location.href,
    searchParams: Object.fromEntries(searchParams.entries()),
    editParam: searchParams.get('edit'),
    isEditMode,
    pathname: window.location.pathname
  });
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
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
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  // Function to fetch existing profile data using secure function
  const fetchExistingProfileData = async () => {
    console.log('🔍 fetchExistingProfileData called:', {
      userId: user?.id,
      isEditMode,
      userEmail: user?.email
    });

    if (!user?.id || !isEditMode) {
      console.log('⚠️ Skipping profile fetch:', { 
        hasUserId: !!user?.id, 
        isEditMode,
        reason: !user?.id ? 'No user ID' : 'Not in edit mode'
      });
      setDataLoading(false);
      return;
    }

    try {
      console.log('📡 Fetching existing profile data using secure function...');
      console.log('🔍 Query details:', {
        function: 'get_user_profile_secure',
        userId: user.id,
        userEmail: user.email
      });
      
      const { data, error } = await supabase.rpc('get_user_profile_secure', {
        target_user_id: user.id
      });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        toast.error('Failed to load existing profile data');
        setDataLoading(false);
        return;
      }

      console.log('📊 Profile query result:', { data, hasData: !!data });

      if (data && data.length > 0) {
        const profile = data[0];
        console.log('✅ Found existing profile data:', profile);
        console.log('📝 Populating form fields...');
        
        // Populate basic info
        setFirstName(profile.first_name || profile.full_name?.split(' ')[0] || '');
        setLastName(profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '');
        setPhoneNumber(profile.phone_number || '');
        setLocation(profile.location || '');
        setAddress(profile.address || '');
        setAvatarUrl(profile.avatar_url || null);
        
        // Populate care recipient info
        setCareRecipientName(profile.care_recipient_name || '');
        setRelationship(profile.relationship || '');
        
        // Populate care needs (handle arrays)
        setCareTypes(profile.care_types || []);
        setSpecialNeeds(profile.special_needs || []);
        
        // Populate care schedule (convert from comma-separated string to array)
        if (profile.care_schedule) {
          const scheduleArray = profile.care_schedule.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
          setCareSchedule(scheduleArray);
        }
        setCustomCareSchedule(profile.custom_schedule || '');
        
        // Populate preferences
        setBudget(profile.budget_preferences || '');
        setCaregiverType(profile.caregiver_type || '');
        setCaregiverPreferences(profile.caregiver_preferences || '');
        setAdditionalNotes(profile.additional_notes || '');
        setPreferredContactMethod(profile.preferred_contact_method || '');
        
        console.log('✅ Form populated with profile data');
        
        // Show feedback when data is loaded for editing
        if (isEditMode) {
          toast.success('Profile data loaded for editing');
        }
      } else {
        console.log('⚠️ No profile data found in database');
        console.log('🔄 Attempting fallback to user metadata for basic info...');
        
        // Fallback: populate basic info from user metadata if available
        if (user?.user_metadata) {
          const metadata = user.user_metadata;
          console.log('📊 User metadata available:', metadata);
          
          if (metadata.first_name) {
            setFirstName(metadata.first_name);
            console.log('✅ Set firstName from metadata:', metadata.first_name);
          }
          if (metadata.last_name) {
            setLastName(metadata.last_name);
            console.log('✅ Set lastName from metadata:', metadata.last_name);
          }
          if (metadata.full_name && !metadata.first_name && !metadata.last_name) {
            const nameParts = metadata.full_name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            console.log('✅ Set name from full_name:', { first: nameParts[0], last: nameParts.slice(1).join(' ') });
          }
        } else {
          console.log('⚠️ No user metadata available either');
        }
      }
    } catch (error) {
      console.error('Error in fetchExistingProfileData:', error);
      toast.error('Failed to load profile data');
    } finally {
      setDataLoading(false);
    }
  };

  // Load user metadata and existing profile data
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      
      // Only load metadata if not in edit mode (edit mode will fetch from database)
      if (!isEditMode && user.user_metadata) {
        const metadata = user.user_metadata;
        if (metadata.first_name) setFirstName(metadata.first_name);
        if (metadata.last_name) setLastName(metadata.last_name);
        if (metadata.full_name && !metadata.first_name && !metadata.last_name) {
          const nameParts = metadata.full_name.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }
      }
      
      // Fetch existing profile data if in edit mode
      fetchExistingProfileData();
    }
  }, [user, isEditMode]);

  // Check for auto-redirect flag from chat (only if not in edit mode)
  useEffect(() => {
    if (!isEditMode) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      if (sessionId) {
        const shouldAutoRedirect = localStorage.getItem(`tavara_chat_auto_redirect_${sessionId}`);
        if (shouldAutoRedirect === "true") {
          console.log("Auto-submit flag detected from chat flow");
          setShouldAutoSubmit(true);
        }
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    setAuthFlowFlag(AUTH_FLOW_FLAGS.SKIP_REGISTRATION_REDIRECT);
    
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
        setLocation(value);
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

  // Apply prefill data when available (only if not in edit mode)
  useEffect(() => {
    if (!prefillApplied && !isEditMode) {
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
          formRef: formRef,
          formType: 'registration'
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
  }, [prefillApplied, shouldAutoSubmit, user, isEditMode]);

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

  const validateForm = () => {
    const errors: string[] = [];

    // Basic required fields
    if (!firstName) errors.push('First Name is required');
    if (!lastName) errors.push('Last Name is required');
    if (!phoneNumber) errors.push('Phone Number is required');
    if (!location) errors.push('Location is required');
    if (!address) errors.push('Address is required');
    if (!careRecipientName) errors.push('Care Recipient Name is required');
    if (!relationship) errors.push('Relationship is required');

    // Care-specific validation - require at least one selection
    if (careTypes.length === 0) {
      errors.push('Please select at least one type of care assistance needed');
    }

    if (careSchedule.length === 0) {
      errors.push('Please select at least one care schedule option');
    }

    // Budget & Caregiver Preferences validation
    if (!budget) {
      errors.push('Budget range is required');
    }

    if (!caregiverType) {
      errors.push('Type of caregiver preferred is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please complete all required fields and care preferences');
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Demo mode - skip database operations
    if (isExternalDemo || isDemo) {
      toast.success('Demo Registration Complete! 🎉 Your information has been simulated successfully.');
      setTimeout(() => {
        navigate('/demo/family/care-assessment');
      }, 1500);
      return;
    }

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
      const profileData = {
        id: user.id,
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        phone_number: phoneNumber,
        location: location,
        address: address,
        role: 'family' as const,
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

      console.log('Updating family profile with data:', profileData);
      
      // Use SECURITY DEFINER function to bypass RLS and prevent recursion
      const { data, error } = await supabase.rpc('update_user_profile', {
        profile_data: profileData
      });
      
      if (error) throw error;
      
      // Only clear chat session data if not in edit mode
      if (!isEditMode) {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session');
        
        clearChatSessionData(sessionId || undefined);
        
        if (sessionId) {
          localStorage.removeItem(`tavara_chat_auto_redirect_${sessionId}`);
          localStorage.removeItem(`tavara_chat_transition_${sessionId}`);
        }
      }

      const successMessage = isEditMode 
        ? 'Profile Updated! Your family profile has been successfully updated.'
        : 'Registration Complete! Your family profile has been updated.';
      
      toast.success(successMessage);
      
      navigate('/dashboard/family');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching data in edit mode
  if (dataLoading && isEditMode) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          breadcrumbItems={[
            { label: "Family Dashboard", path: "/dashboard/family" },
            { label: "Edit Family Profile", path: "/registration/family?edit=true" }
          ]} 
        />
        <div className="container max-w-4xl py-10">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your profile data...</p>
            </div>
          </div>
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
          { 
            label: isDemo ? "TAV Demo" : "Family Dashboard", 
            path: isDemo ? "/tav-demo?openDemo=true" : "/dashboard/family" 
          },
          { label: isEditMode ? "Edit Family Profile" : "Family Registration", path: `/registration/family${isEditMode ? '?edit=true' : ''}` }
        ]} 
      />
      
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? 'Edit Family Care Profile' : 'Family Care Registration'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isEditMode 
            ? 'Update your family profile information and care preferences.'
            : 'Complete your family profile to find the right caregiver for your loved one.'
          }
        </p>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-medium text-red-800">Please complete the following:</h3>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Personal & Contact Information */}
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
                    className={validationErrors.some(e => e.includes('First Name')) ? 'border-red-500' : ''}
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
                    className={validationErrors.some(e => e.includes('Last Name')) ? 'border-red-500' : ''}
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
                  className={validationErrors.some(e => e.includes('Phone Number')) ? 'border-red-500' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={location} onValueChange={setLocation} required>
                  <SelectTrigger id="location" className={validationErrors.some(e => e.includes('Location')) ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <div className="max-h-60 overflow-y-auto">
                      {TRINIDAD_TOBAGO_LOCATIONS.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Specific Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="Your specific address (street, building, etc.)" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className={validationErrors.some(e => e.includes('Address')) ? 'border-red-500' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Care Recipient Information */}
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
                  className={validationErrors.some(e => e.includes('Care Recipient Name')) ? 'border-red-500' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to Care Recipient *</Label>
                <Select value={relationship} onValueChange={setRelationship} required>
                  <SelectTrigger id="relationship" className={validationErrors.some(e => e.includes('Relationship')) ? 'border-red-500' : ''}>
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

          {/* Care Needs & Preferences - Now Required */}
          <Card className={`mb-8 ${validationErrors.some(e => e.includes('care assistance')) ? 'border-red-500' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Care Needs & Preferences *
                <span className="text-red-500">*Required</span>
              </CardTitle>
              <CardDescription>
                Share the types of care assistance needed and any special needs. Please select at least one option.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Care Types – What type of care assistance do you need? (Select all that apply) *</Label>
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
                {validationErrors.some(e => e.includes('care assistance')) && (
                  <p className="text-sm text-red-600 mt-1">Please select at least one type of care assistance</p>
                )}
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

          {/* Care Schedule & Availability - Now Required */}
          <Card className={`mb-8 ${validationErrors.some(e => e.includes('care schedule')) ? 'border-red-500' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📅 Care Schedule & Availability *
                <span className="text-red-500">*Required</span>
              </CardTitle>
              <CardDescription>
                When do you need care support? Select all time slots that work for your family. Please select at least one option.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Care Schedule – When do you need caregiving support? *</Label>
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
                {validationErrors.some(e => e.includes('care schedule')) && (
                  <p className="text-sm text-red-600 mt-1">Please select at least one care schedule option</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget & Caregiver Preferences - Now Required */}
          <Card className={`mb-8 ${validationErrors.some(e => e.includes('Budget') || e.includes('caregiver')) ? 'border-red-500' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Budget & Caregiver Preferences *
                <span className="text-red-500">*Required</span>
              </CardTitle>
              <CardDescription>
                Share your budget and preferences for caregivers. These fields are required to help us match you with suitable caregivers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range *</Label>
                <Select value={budget} onValueChange={setBudget} required>
                  <SelectTrigger id="budget" className={validationErrors.some(e => e.includes('Budget')) ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="under_15">Under $15/hour</SelectItem>
                    <SelectItem value="15_20">$15-$20/hour</SelectItem>
                    <SelectItem value="20_25">$20-$25/hour</SelectItem>
                    <SelectItem value="25_30">$25-$30/hour</SelectItem>
                    <SelectItem value="30_plus">$30+/hour</SelectItem>
                    <SelectItem value="not_sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.some(e => e.includes('Budget')) && (
                  <p className="text-sm text-red-600 mt-1">Budget range is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="caregiverType">Type of Caregiver Preferred *</Label>
                <Select value={caregiverType} onValueChange={setCaregiverType} required>
                  <SelectTrigger id="caregiverType" className={validationErrors.some(e => e.includes('caregiver')) ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select caregiver type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="professional">👩‍⚕️ Professional Caregiver (trained, experienced)</SelectItem>
                    <SelectItem value="nurse">🏥 Nurse (RN or LPN)</SelectItem>
                    <SelectItem value="companion">👥 Companion Caregiver (non-medical)</SelectItem>
                    <SelectItem value="specialized">🔬 Specialized Care Provider</SelectItem>
                    <SelectItem value="no_preference">🤷 No specific preference</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.some(e => e.includes('caregiver')) && (
                  <p className="text-sm text-red-600 mt-1">Type of caregiver preferred is required</p>
                )}
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

          {/* Additional Information */}
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
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/family')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Profile' : 'Complete Registration')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyRegistration;
