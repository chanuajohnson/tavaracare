import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase, ensureStorageBuckets, ensureAuthContext } from '../../lib/supabase';
import { Button } from '@/components/ui/button';
import { PersonalInfoSection } from '@/components/registration/family/PersonalInfoSection';
import { CareRecipientSection } from '@/components/registration/family/CareRecipientSection';
import { ScheduleSection } from '@/components/registration/family/ScheduleSection';
import { PreferencesSection } from '@/components/registration/family/PreferencesSection';
import { toast } from 'sonner';

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
  const navigate = useNavigate();

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
      const updatedProfileData = {
        ...profileData,
        care_schedule: Array.isArray(profileData.care_schedule) 
          ? profileData.care_schedule.join(', ')
          : profileData.care_schedule
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
    } catch (err) {
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

      <form onSubmit={handleSubmit}>
        <PersonalInfoSection
          firstName={firstName}
          lastName={lastName}
          email={email}
          phoneNumber={phoneNumber}
          address={address}
          avatarUrl={avatarUrl}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneNumberChange={setPhoneNumber}
          onAddressChange={setAddress}
          onAvatarChange={handleAvatarChange}
        />

        <CareRecipientSection
          careRecipientName={careRecipientName}
          relationship={relationship}
          careTypes={careTypes}
          caregiverType={caregiverType}
          onCareRecipientNameChange={setCareRecipientName}
          onRelationshipChange={setRelationship}
          onCareTypesChange={(value) => handleCheckboxArrayChange(value, careTypes, setCareTypes)}
          onCaregiverTypeChange={setCaregiverType}
        />

        <ScheduleSection
          careSchedule={careSchedule}
          customSchedule={customSchedule}
          onCareScheduleChange={handleCareScheduleChange}
          onCustomScheduleChange={setCustomSchedule}
        />

        <PreferencesSection
          caregiverPreferences={caregiverPreferences}
          emergencyContact={emergencyContact}
          budgetPreferences={budgetPreferences}
          preferredContactMethod={preferredContactMethod}
          additionalNotes={additionalNotes}
          onCaregiverPreferencesChange={setCaregiverPreferences}
          onEmergencyContactChange={setEmergencyContact}
          onBudgetPreferencesChange={setBudgetPreferences}
          onPreferredContactMethodChange={setPreferredContactMethod}
          onAdditionalNotesChange={setAdditionalNotes}
        />

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
