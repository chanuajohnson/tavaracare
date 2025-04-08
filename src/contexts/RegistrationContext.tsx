
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { enhancedSupabaseClient } from '@/lib/supabase';
import { RegistrationProgress, RegistrationStep } from '@/types/registration';
import { getOrCreateSessionId, getDeviceInfo, detectExitIntent } from '@/utils/sessionHelper';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface RegistrationContextType {
  registrationData: Record<string, any>;
  currentStepIndex: number;
  progress: number;
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  totalSteps: number;
  steps: RegistrationStep[];
  currentStep: RegistrationStep | null;
  registrationId: string | null;
  saveProgress: () => Promise<void>;
  updateData: (newData: Record<string, any>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepIndex: number) => void;
  isStepValid: (stepIndex?: number) => boolean;
  submitRegistration: () => Promise<void>;
  estimatedTimeRemaining: number;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};

interface RegistrationProviderProps {
  children: React.ReactNode;
  registrationFlowType: 'family' | 'professional' | 'community';
  steps: RegistrationStep[];
  initialData?: Record<string, any>;
  onComplete?: (data: Record<string, any>) => void;
}

export const RegistrationProvider: React.FC<RegistrationProviderProps> = ({
  children,
  steps,
  registrationFlowType,
  initialData = {},
  onComplete,
}) => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState<Record<string, any>>(initialData);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationRecord, setRegistrationRecord] = useState<RegistrationProgress | null>(null);
  const [exitIntentShown, setExitIntentShown] = useState(false);

  const totalEstimatedTime = steps.reduce((total, step) => total + step.estimatedTimeSeconds, 0);
  
  const estimatedTimeRemaining = Math.round(
    totalEstimatedTime * (1 - (currentStepIndex / steps.length))
  );

  const filteredSteps = steps.filter(step => {
    if (!step.condition) return true;
    return step.condition(registrationData);
  });

  useEffect(() => {
    const loadExistingRegistration = async () => {
      try {
        setLoading(true);
        
        const sessionId = getOrCreateSessionId();
        
        const { data: authData } = await enhancedSupabaseClient().client.auth.getUser();
        const userId = authData.user?.id;

        const { data, error } = await enhancedSupabaseClient()
          .registrationProgress()
          .select('*')
          .eq('status', 'in_progress')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const registration = data[0];
          
          setRegistrationRecord(registration);
          setRegistrationId(registration.id);
          setRegistrationData(registration.registrationData || {});
          
          const stepIndex = steps.findIndex(s => s.id === registration.currentStep);
          if (stepIndex >= 0) {
            setCurrentStepIndex(stepIndex);
          }
          
          const completed = Object.values(registration.completedSteps || {}).filter(Boolean).length;
          const totalStepCount = steps.length;
          setProgress(Math.round((completed / totalStepCount) * 100));
          
          toast.info("Welcome back! We've restored your progress.");
        } else {
          const newRegistrationId = uuidv4();
          
          const { error: createError } = await enhancedSupabaseClient()
            .registrationProgress()
            .insert({
              id: newRegistrationId,
              userId: userId || undefined,
              sessionId: sessionId,
              currentStep: steps[0].id,
              registrationData: initialData,
              status: 'started',
              totalSteps: filteredSteps.length,
              deviceInfo: getDeviceInfo(),
              completedSteps: {},
              lastActiveAt: new Date().toISOString()
            } as Partial<RegistrationProgress>);
            
          if (createError) throw createError;
          
          setRegistrationId(newRegistrationId);
          setRegistrationData(initialData);
        }
      } catch (err: any) {
        console.error('Error loading registration data:', err);
        setError('Failed to load registration data.');
        toast.error('There was a problem loading your registration data.');
      } finally {
        setLoading(false);
      }
    };

    loadExistingRegistration();

    const clearExitIntent = detectExitIntent(() => {
      if (!exitIntentShown && currentStepIndex > 0) {
        setExitIntentShown(true);
        saveProgress();
        toast.info(
          "Don't leave just yet!", 
          { 
            description: "We've saved your progress. You can come back anytime and continue where you left off.",
            duration: 10000,
          }
        );
      }
    });

    return clearExitIntent;
  }, []);

  useEffect(() => {
    const newProgress = Math.round(((currentStepIndex + 1) / filteredSteps.length) * 100);
    setProgress(Math.min(newProgress, 100));
  }, [currentStepIndex, filteredSteps.length]);

  const saveProgress = useCallback(async () => {
    if (!registrationId) return;

    try {
      const updatedCompletedSteps = {
        ...(registrationRecord?.completedSteps || {}),
        [filteredSteps[currentStepIndex].id]: true,
      };

      await enhancedSupabaseClient()
        .registrationProgress()
        .update({
          id: registrationId,
          registrationData: registrationData,
          currentStep: filteredSteps[currentStepIndex].id,
          status: 'in_progress',
          lastActiveAt: new Date().toISOString(),
          completedSteps: updatedCompletedSteps,
          completedStepCount: Object.values(updatedCompletedSteps).filter(Boolean).length,
        } as Partial<RegistrationProgress>)
        .eq('id', registrationId);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [registrationId, currentStepIndex, registrationData, filteredSteps, registrationRecord]);

  const updateData = useCallback((newData: Record<string, any>) => {
    setRegistrationData(prev => ({
      ...prev,
      ...newData,
    }));
  }, []);

  const isStepValid = useCallback((stepIndex?: number) => {
    const step = filteredSteps[stepIndex !== undefined ? stepIndex : currentStepIndex];
    
    if (!step.validateStep) return true;
    
    const result = step.validateStep(registrationData);
    return typeof result === 'object' ? result.valid : result;
  }, [filteredSteps, currentStepIndex, registrationData]);

  const goToNextStep = useCallback(async () => {
    if (!isStepValid()) {
      toast.warning('Please complete all required fields before continuing.');
      return;
    }

    await saveProgress();

    if (currentStepIndex < filteredSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      await submitRegistration();
    }
  }, [currentStepIndex, filteredSteps.length, isStepValid, saveProgress]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < filteredSteps.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, [filteredSteps.length]);

  const submitRegistration = useCallback(async () => {
    if (!registrationId) return;
    
    setIsSubmitting(true);
    
    try {
      await enhancedSupabaseClient()
        .registrationProgress()
        .update({
          id: registrationId,
          registrationData: registrationData,
          status: 'completed',
          completedStepCount: filteredSteps.length,
        } as Partial<RegistrationProgress>)
        .eq('id', registrationId);

      if (onComplete) {
        onComplete(registrationData);
      }
      
      toast.success('Registration completed successfully!');
      
      navigate(`/dashboards/${registrationFlowType.toLowerCase()}`);
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setError('Failed to submit registration. Please try again.');
      toast.error('There was a problem submitting your registration.');
    } finally {
      setIsSubmitting(false);
    }
  }, [registrationId, registrationData, filteredSteps.length, onComplete, navigate, registrationFlowType]);

  const value = {
    registrationData,
    currentStepIndex,
    progress,
    loading,
    error,
    isSubmitting,
    totalSteps: filteredSteps.length,
    steps: filteredSteps,
    currentStep: filteredSteps[currentStepIndex] || null,
    registrationId,
    saveProgress,
    updateData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isStepValid,
    submitRegistration,
    estimatedTimeRemaining,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};
