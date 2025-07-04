
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export const useEnhancedJourneyProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [careAssessment, setCareAssessment] = useState<any>(null);
  const [careRecipient, setCareRecipient] = useState<any>(null);
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCancelVisitModal, setShowCancelVisitModal] = useState(false);
  const [showCaregiverMatchingModal, setShowCaregiverMatchingModal] = useState(false);

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
        console.log('Profile data loaded:', profileData);
      }

      // Fetch care plans
      const { data: carePlansData, error: carePlansError } = await supabase
        .from('care_plans')
        .select('*')
        .eq('family_id', user.id);

      if (carePlansError) {
        console.error('Error fetching care plans:', carePlansError);
      } else {
        setCarePlans(carePlansData || []);
      }

      // Fetch care assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('care_needs_family')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (assessmentError) {
        console.error('Error fetching care assessment:', assessmentError);
      } else {
        setCareAssessment(assessmentData);
      }

      // Fetch care recipient
      const { data: recipientData, error: recipientError } = await supabase
        .from('care_recipient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (recipientError) {
        console.error('Error fetching care recipient:', recipientError);
      } else {
        setCareRecipient(recipientData);
      }

      // Fetch visit details
      const { data: visitData, error: visitError } = await supabase
        .from('visit_bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_cancelled', false)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (visitError) {
        console.error('Error fetching visit details:', visitError);
      } else {
        setVisitDetails(visitData);
      }

    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  // Calculate completion status for each step
  const calculateSteps = () => {
    if (!profile) return [];

    console.log('Calculating steps with profile:', profile);

    const steps = [
      {
        id: 1,
        step_number: 1,
        title: "Welcome & Profile Setup",
        description: "Basic account information",
        completed: !!profile?.full_name,
        accessible: true,
        action: () => console.log('Navigate to profile setup')
      },
      {
        id: 2,
        step_number: 2,
        title: "Complete your registration",
        description: "Family care details and preferences",
        completed: calculateRegistrationCompletion(),
        accessible: true,
        action: () => console.log('Navigate to registration')
      },
      {
        id: 5,
        step_number: 5,
        title: "Care Assessment",
        description: "Detailed care needs evaluation",
        completed: !!careAssessment?.id,
        accessible: true,
        action: () => console.log('Navigate to care assessment')
      },
      {
        id: 6,
        step_number: 6,
        title: "Share Loved One's Story",
        description: "Personal details and preferences",
        completed: !!(careRecipient?.id && careRecipient?.full_name),
        accessible: true,
        action: () => console.log('Navigate to story')
      },
      {
        id: 7,
        step_number: 7,
        title: "View Caregiver Matches",
        description: "Browse potential caregivers",
        completed: false,
        accessible: calculateCaregiverMatchesAccessible(),
        action: () => setShowCaregiverMatchingModal(true)
      },
      {
        id: 10,
        step_number: 10,
        title: "Schedule Visit",
        description: "Book your Tavara.Care assessment visit",
        completed: !!visitDetails?.id,
        accessible: true,
        action: () => {
          if (visitDetails?.id) {
            setShowCancelVisitModal(true);
          } else {
            setShowScheduleModal(true);
          }
        }
      }
    ];

    return steps;
  };

  // Enhanced registration completion logic using correct database field names
  const calculateRegistrationCompletion = () => {
    if (!profile) {
      console.log('Registration completion: No profile data');
      return false;
    }

    // Core required fields (must have all)
    const requiredFields = {
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      address: profile.address,
      care_recipient_name: profile.care_recipient_name,
      relationship: profile.relationship
    };

    const hasAllRequiredFields = Object.entries(requiredFields).every(([field, value]) => {
      const hasValue = !!(value && String(value).trim());
      if (!hasValue) {
        console.log(`Registration completion: Missing required field ${field}`);
      }
      return hasValue;
    });

    // Enhanced completion indicators (at least one should be present for comprehensive registration)
    const enhancedFields = {
      care_types: profile.care_types && Array.isArray(profile.care_types) && profile.care_types.length > 0,
      care_schedule: profile.care_schedule && String(profile.care_schedule).trim(),
      budget_preferences: profile.budget_preferences && String(profile.budget_preferences).trim(),
      caregiver_type: profile.caregiver_type && String(profile.caregiver_type).trim()
    };

    const hasEnhancedData = Object.values(enhancedFields).some(Boolean);

    console.log('Registration completion check:', {
      hasAllRequiredFields,
      hasEnhancedData,
      requiredFields,
      enhancedFields,
      finalResult: hasAllRequiredFields && hasEnhancedData
    });

    // Registration is complete if has all required fields AND at least some enhanced data
    return hasAllRequiredFields && hasEnhancedData;
  };

  // Calculate if caregiver matches are accessible
  const calculateCaregiverMatchesAccessible = () => {
    const registrationComplete = calculateRegistrationCompletion();
    const hasAssessment = !!careAssessment?.id;
    
    console.log('Caregiver matches accessibility:', {
      registrationComplete,
      hasAssessment,
      accessible: registrationComplete && hasAssessment
    });
    
    return registrationComplete && hasAssessment;
  };

  const steps_calculated = calculateSteps();

  const onVisitScheduled = (visitData: any) => {
    setVisitDetails(visitData);
    setShowScheduleModal(false);
    toast.success('Visit scheduled successfully!');
    fetchUserData(); // Refresh data
  };

  const onVisitCancelled = () => {
    setVisitDetails(null);
    setShowCancelVisitModal(false);
    toast.success('Visit cancelled successfully');
    fetchUserData(); // Refresh data
  };

  return {
    loading,
    steps: steps_calculated,
    profile,
    carePlans,
    careAssessment,
    careRecipient,
    visitDetails,
    showScheduleModal,
    setShowScheduleModal,
    showCancelVisitModal,
    setShowCancelVisitModal,
    showCaregiverMatchingModal,
    setShowCaregiverMatchingModal,
    onVisitScheduled,
    onVisitCancelled,
    refreshData: fetchUserData
  };
};
