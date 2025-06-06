import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useVisitBookings } from './useVisitBookings';

interface Profile {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  care_model: string;
}

interface CareRecipientProfile {
  id: string;
  created_at: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  medical_conditions: string;
  mobility_level: string;
  cognitive_abilities: string;
  personal_interests: string;
  daily_routine: string;
}

interface CareNeeds {
  id: string;
  created_at: string;
  user_id: string;
  care_type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  frequency: string;
  specific_days: string;
  tasks: string;
  notes: string;
}

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  status: string;
  buttonText: string;
  completed: boolean;
  icon?: string;
  estimatedTime?: string;
  action?: () => void;
  clickable?: boolean;
}

export const useFamilyJourneyProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeBooking } = useVisitBookings();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [careRecipientProfile, setCareRecipientProfile] = useState<CareRecipientProfile | null>(null);
  const [careNeeds, setCareNeeds] = useState<CareNeeds | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      setProfile(profileData as Profile);

      const { data: careRecipientData, error: careRecipientError } = await supabase
        .from('care_recipient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (careRecipientError && careRecipientError.message !== 'No rows found') {
        console.error("Error fetching care recipient profile:", careRecipientError);
      }

      setCareRecipientProfile(careRecipientData as CareRecipientProfile);

      const { data: careNeedsData, error: careNeedsError } = await supabase
        .from('care_needs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (careNeedsError && careNeedsError.message !== 'No rows found') {
        console.error("Error fetching care needs:", careNeedsError);
      }

      setCareNeeds(careNeedsData as CareNeeds);
    } catch (error) {
      console.error("Unexpected error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced getJourneySteps function with visit booking integration
  const getJourneySteps = (): JourneyStep[] => {
    // Step 8: Visit Confirmation - Enhanced with booking status
    const getVisitStatus = () => {
      if (!activeBooking) return { status: 'Complete', clickable: true };
      if (activeBooking.admin_status === 'completed') return { status: 'Complete', clickable: false };
      if (activeBooking.admin_status === 'confirmed' || activeBooking.admin_status === 'pending') {
        return { status: 'In Progress', clickable: false };
      }
      return { status: 'Scheduled', clickable: true };
    };

    const visitStatusInfo = getVisitStatus();
    const visitCompleted = activeBooking?.admin_status === 'completed';

    const steps: JourneyStep[] = [
      {
        id: 1,
        title: "Family Profile",
        description: "Share basic information about your family and care needs to help us understand your situation.",
        status: profile?.full_name ? "Complete" : "Complete",
        buttonText: profile?.full_name ? "Edit Profile" : "Complete Profile",
        completed: !!profile?.full_name,
        estimatedTime: "5-10 minutes",
        action: () => navigate('/registration/family/profile')
      },
      {
        id: 2,
        title: "Tell Their Story",
        description: "Help us understand your loved one's personality, preferences, and daily routines for better caregiver matching.",
        status: careRecipientProfile ? "Complete" : "Complete",
        buttonText: careRecipientProfile ? "Edit Story" : "Tell Story",
        completed: !!careRecipientProfile,
        estimatedTime: "10-15 minutes",
        action: () => navigate('/registration/family/care-recipient')
      },
      {
        id: 3,
        title: "Care Needs Assessment",
        description: "Specify the type of care services needed and your scheduling preferences.",
        status: careNeeds ? "Complete" : "Complete",
        buttonText: careNeeds ? "Edit Assessment" : "Complete Assessment",
        completed: !!careNeeds,
        estimatedTime: "10-15 minutes",
        action: () => navigate('/registration/family/care-needs')
      },
      {
        id: 4,
        title: "Find Caregiver Matches",
        description: "Browse and review qualified caregivers who match your specific care requirements.",
        status: "Complete",
        buttonText: "Browse Matches",
        completed: profile?.full_name && careRecipientProfile && careNeeds,
        estimatedTime: "15-30 minutes",
        action: () => navigate('/family/matching')
      },
      {
        id: 5,
        title: "Get Matched Instantly",
        description: "Get instantly matched with a pre-screened caregiver based on your care needs and preferences.",
        status: "Complete",
        buttonText: "Get Instant Match",
        completed: profile?.full_name && careRecipientProfile && careNeeds,
        estimatedTime: "2-5 minutes",
        action: () => navigate('/family/instant-matching')
      },
      {
        id: 6,
        title: "Schedule Your Visit",
        description: "Book a consultation with our care coordinator to discuss your care plan and next steps.",
        status: activeBooking ? "Complete" : "Complete",
        buttonText: activeBooking ? "View Visit" : "Schedule Visit",
        completed: !!activeBooking,
        estimatedTime: "5 minutes",
        action: () => {
          if (activeBooking) {
            navigate('/family/care-journey-progress');
          } else {
            navigate('/family/schedule-visit');
          }
        }
      },
      {
        id: 7,
        title: "Complete Visit",
        description: "Meet with your care coordinator to finalize your care plan and get started with services.",
        status: visitCompleted ? "Complete" : activeBooking ? "Scheduled" : "Pending",
        buttonText: visitCompleted ? "View Summary" : activeBooking ? "View Visit" : "Schedule First",
        completed: visitCompleted,
        estimatedTime: "60-90 minutes",
        action: visitCompleted ? () => navigate('/family/visit-summary') : 
                activeBooking ? () => navigate('/family/care-journey-progress') :
                () => navigate('/family/schedule-visit')
      },
      {
        id: 8,
        title: "Confirm Visit",
        description: "Your visit completion will be confirmed by our care coordinator team.",
        status: visitStatusInfo.status,
        buttonText: activeBooking && visitStatusInfo.status === 'Scheduled' ? "Modify Visit" : visitStatusInfo.status,
        completed: visitCompleted,
        clickable: visitStatusInfo.clickable,
        estimatedTime: "Automatic",
        action: activeBooking && visitStatusInfo.status === 'Scheduled' ? 
          () => {
            // This will be handled by the parent component
            console.log('Modify visit action triggered');
          } : undefined
      },
      {
        id: 9,
        title: "Book Trial Day",
        description: "Experience our care services with a trial day before committing to long-term care.",
        status: visitCompleted ? "Available" : "Locked",
        buttonText: visitCompleted ? "Book Trial" : "Complete Visit First",
        completed: false,
        estimatedTime: "8 hours",
        action: visitCompleted ? () => navigate('/family/trial-day-booking') : undefined
      }
    ];

    return steps;
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const allSteps = getJourneySteps();
  const completedSteps = allSteps.filter(step => step.completed);
  const currentStepIndex = completedSteps.length;
  const totalSteps = allSteps.length;
  const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);

  const journeyStage = (() => {
    if (!profile) return 'foundation';
    if (!careRecipientProfile) return 'foundation';
    if (!careNeeds) return 'foundation';
    if (!activeBooking) return 'scheduling';
    if (activeBooking?.admin_status !== 'completed') return 'scheduling';
    return 'conversion';
  })();

  const nextStep = allSteps.find(step => !step.completed);

  return {
    profile,
    careRecipientProfile,
    careNeeds,
    completionPercentage,
    currentStepIndex,
    totalSteps,
    nextStep: allSteps.find(step => !step.completed),
    allSteps,
    journeyStage,
    careModel: profile?.care_model || null,
    trialCompleted: false,
    loading
  };
};
