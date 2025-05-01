import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ensureUserProfile } from '@/lib/profile-utils';
import { 
  getCurrentEnvironment, 
  getEnvironmentInfo, 
  verifySchemaCompatibility 
} from '@/integrations/supabase/client';
import { getPrefillDataFromUrl, applyPrefillDataToForm } from '@/utils/chat/prefillReader';

const ProfessionalRegistrationFix = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [currentEnv, setCurrentEnv] = useState<string>('unknown');
  const [schemaStatus, setSchemaStatus] = useState<{
    compatible: boolean;
    missingColumns: string[];
  } | null>(null);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Function to set form field values from prefill data
  const setFormValue = (field: string, value: any) => {
    console.log(`Professional registration received prefill data for ${field}:`, value);
    // For this simplified form, we don't need to set many fields
    // But we log it so we can see what data was received
  };

  // Apply prefill data when available
  useEffect(() => {
    // Only try to apply prefill once
    if (!prefillApplied) {
      console.log('Professional registration checking for prefill data...');
      
      // Try to apply prefill data from URL and localStorage
      const hasPrefill = applyPrefillDataToForm(
        setFormValue, 
        { 
          logDataReceived: true,
          checkAutoSubmit: true,
          autoSubmitCallback: () => {
            console.log('Auto-submitting professional registration form via callback');
            handleSubmit(new Event('autosubmit') as any);
          },
          formRef: formRef
        }
      );
      
      if (hasPrefill) {
        console.log('Successfully applied prefill data to professional registration form');
        toast.success('Your chat information has been applied to this form');
      }
      
      setPrefillApplied(true);
    }
  }, [prefillApplied]);

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const env = getCurrentEnvironment();
        setCurrentEnv(env);
        
        // Get additional environment details for debugging
        const envInfo = getEnvironmentInfo();
        console.log('Environment info:', envInfo);
        
        console.log('Checking Supabase connection in environment:', env);
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error(`Supabase connection error in ${env} environment:`, error);
          setConnectionStatus('error');
          toast.error(`Database connection error: ${error.message}`);
        } else {
          console.log(`Successfully connected to Supabase (${env}):`, data);
          setConnectionStatus('connected');
          
          // Check schema compatibility
          const schemaCheck = await verifySchemaCompatibility();
          console.log('Schema compatibility check:', schemaCheck);
          setSchemaStatus({
            compatible: schemaCheck.compatible,
            missingColumns: schemaCheck.missingColumns
          });
          
          if (!schemaCheck.compatible) {
            toast.warning("Schema differences detected", {
              description: "Some database features may be limited in this environment.",
              duration: 5000
            });
          }
        }
      } catch (err: any) {
        console.error('Unexpected error checking connection:', err);
        setConnectionStatus('error');
        toast.error(`Unexpected connection error: ${err.message || 'Unknown error'}`);
      }
    };

    checkConnection();
  }, []);

  // Function to create professional profile with retry logic
  const createProfessionalProfile = async (): Promise<{ success: boolean; error?: string }> => {
    let retries = 0;
    const MAX_RETRIES = 3;
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`Attempt ${retries + 1} to update profile for user:`, user?.id);
        
        if (!user?.id) {
          throw new Error('User ID is not available');
        }
        
        // Use the ensureUserProfile utility function
        const result = await ensureUserProfile(user.id, 'professional');
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update profile');
        }
        
        // Update additional professional fields with a more resilient approach
        try {
          const updateData = { 
            professional_type: 'Healthcare Professional',
            updated_at: new Date().toISOString()
          };
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating professional type:', updateError);
            
            // If the error is about schema, try a simpler update
            if (updateError.message.includes('column') || updateError.message.includes('schema')) {
              console.log('Trying minimal profile update due to schema issues...');
              
              const { error: minimalUpdateError } = await supabase
                .from('profiles')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', user.id);
              
              if (minimalUpdateError) {
                throw new Error(`Failed with minimal update: ${minimalUpdateError.message}`);
              }
            } else {
              throw new Error(`Failed to update professional details: ${updateError.message}`);
            }
          }
        } catch (updateErr: any) {
          console.error('Error during profile update:', updateErr);
          // Continue anyway as the base profile was created
        }
        
        // Save onboarding progress if the column exists
        if (!schemaStatus || schemaStatus.compatible || 
            !schemaStatus.missingColumns.includes('profiles.onboarding_progress')) {
          try {
            console.log('Initializing onboarding_progress');
            // Initialize onboarding progress for a new professional
            const progressData = {
              1: true,  // Mark "Complete profile" as complete
              2: false, // Upload certifications
              3: false, // Set availability
              4: false, // Complete training
              5: false  // Orientation and shadowing
            };
            
            const { error: progressError } = await supabase
              .from('profiles')
              .update({ onboarding_progress: progressData })
              .eq('id', user.id);
              
            if (progressError) {
              if (progressError.message.includes('column') || 
                  progressError.message.includes('does not exist')) {
                console.warn('onboarding_progress column not found, skipping initialization');
              } else {
                console.error('Error initializing onboarding progress:', progressError);
              }
            } else {
              console.log('Successfully initialized onboarding progress');
            }
          } catch (progressErr) {
            console.warn('Error handling onboarding progress:', progressErr);
            // Continue anyway as this is non-critical
          }
        } else {
          console.warn('Skipping onboarding_progress initialization - column missing in this environment');
        }
        
        return { success: true };
      } catch (err: any) {
        console.error(`Attempt ${retries + 1} failed:`, err);
        retries++;
        
        if (retries >= MAX_RETRIES) {
          return { 
            success: false, 
            error: err.message || 'Unknown error occurred after maximum retry attempts'
          };
        }
        
        // Exponential backoff with some randomness
        const delay = Math.min(1000 * (2 ** retries) + Math.random() * 1000, 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return { success: false, error: 'Maximum retries exceeded' };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to complete registration");
      return;
    }

    if (connectionStatus !== 'connected') {
      toast.error("Cannot update profile: database connection issue");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting professional profile creation for user:', user.id, 'in environment:', currentEnv);
      
      const result = await createProfessionalProfile();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create professional profile');
      }
      
      console.log('Professional profile created successfully');
      toast.success("Professional profile created successfully!");
      
      // Delay navigation slightly to ensure toast is visible
      setTimeout(() => {
        navigate('/dashboard/professional');
      }, 1500);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Error creating professional profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-6">Authentication Required</h1>
        <p className="mb-4">You must be logged in to complete your professional registration.</p>
        <Button onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Professional Profile</h1>
      
      {currentEnv !== 'unknown' && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-sm rounded-md">
          Current environment: <strong>{currentEnv}</strong>
          {schemaStatus && !schemaStatus.compatible && (
            <div className="mt-1 text-xs">
              <p>Note: Some database features may be limited in this environment.</p>
              {schemaStatus.missingColumns.length > 0 && (
                <p className="text-yellow-600">Missing columns: {schemaStatus.missingColumns.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {connectionStatus === 'checking' && (
        <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
          Checking database connection...
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          Database connection error. Your profile cannot be saved at this time.
        </div>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <p className="text-gray-600">
          Clicking "Complete Registration" will create your professional profile and redirect you to your dashboard.
        </p>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || connectionStatus !== 'connected'}
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
        </Button>
      </form>
    </div>
  );
};

export default ProfessionalRegistrationFix;
