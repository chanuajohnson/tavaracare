
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface TrialConversionData {
  showConversionModal: boolean;
  trialAmount: number;
  trialCompleted: boolean;
  careModel: string | null;
  loading: boolean;
}

export const useTrialConversion = (): TrialConversionData & {
  setShowConversionModal: (show: boolean) => void;
  checkTrialStatus: () => Promise<void>;
} => {
  const { user } = useAuth();
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [trialAmount, setTrialAmount] = useState(320);
  const [trialCompleted, setTrialCompleted] = useState(false);
  const [careModel, setCareModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkTrialStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check for completed trial payments
      const { data: trialPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'trial_day')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      // Check user profile for visit notes and care model selection
      const { data: profile } = await supabase
        .from('profiles')
        .select('visit_notes, visit_scheduling_status')
        .eq('id', user.id)
        .maybeSingle();

      let visitNotes = null;
      try {
        visitNotes = profile?.visit_notes ? JSON.parse(profile.visit_notes) : null;
      } catch (error) {
        console.error('Error parsing visit notes:', error);
      }

      const hasCompletedTrial = trialPayments && trialPayments.length > 0;
      const hasChosenCareModel = visitNotes?.care_model;
      
      setTrialCompleted(hasCompletedTrial);
      setCareModel(hasChosenCareModel || null);

      if (trialPayments && trialPayments.length > 0) {
        setTrialAmount(Number(trialPayments[0].amount) || 320);
      }

      // Show conversion modal if trial completed but no care model chosen
      if (hasCompletedTrial && !hasChosenCareModel && profile?.visit_scheduling_status === 'completed') {
        setShowConversionModal(true);
      }
      
    } catch (error) {
      console.error('Error checking trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    }
  }, [user]);

  return {
    showConversionModal,
    trialAmount,
    trialCompleted,
    careModel,
    loading,
    setShowConversionModal,
    checkTrialStatus
  };
};
