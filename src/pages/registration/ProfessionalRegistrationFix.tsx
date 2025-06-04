
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
import { clearChatSessionData } from '@/utils/chat/chatSessionUtils';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const [sessionRefreshed, setSessionRefreshed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Function to set form field values from prefill data
  const setFormValue = (field: string, value: any) => {
    console.log(`Professional registration received prefill data for ${field}:`, value);
  };

  // Verify user exists in auth system
  const verifyUserExists = async (): Promise<boolean> => {
    try {
      console.log('Verifying user exists in auth system...');
      
      // First refresh the session to ensure we have the latest auth state
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        toast.error('Session expired. Please log in again.');
        navigate('/auth');
        return false;
      }
      
      if (!refreshData.session?.user) {
        console.error('No user found after session refresh');
        toast.error('Authentication required. Please log in again.');
        navigate('/auth');
        return false;
      }
      
      // Verify user ID matches
      if (refreshData.session.user.id !== user?.id) {
        console.error('User ID mismatch after refresh');
        toast.error('Authentication error. Please log in again.');
        navigate('/auth');
        return false;
      }
      
      setSessionRefreshed(true);
      console.log('User verification successful:', refreshData.session.user.id);
      return true;
    } catch (error: any) {
      console.error('Error verifying user:', error);
      toast.error('Unable to verify user authentication. Please try logging in again.');
      navigate('/auth');
      return false;
    }
  };

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

  // Apply prefill data when available
  useEffect(() => {
    if (!prefillApplied) {
      console.log('Professional registration checking for prefill data...');
      
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
        
        if (shouldAutoSubmit && user) {
          console.log('Auto-submitting form based on chat completion flow');
          setTimeout(() => {
            handleSubmit(new Event('autosubmit') as any);
          }, 800);
        }
      }
      
      setPrefillApplied(true);
    }
  }, [prefillApplied, shouldAutoSubmit, user]);

  // Verify user on component mount and when user changes
  useEffect(() => {
    if (user && !userVerified) {
      verifyUserExists().then(setUserVerified);
    }
  }, [user, userVerified]);

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const env = getCurrentEnvironment();
        setCurrentEnv(env);
        
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

  // Function to create professional profile with enhanced error handling
  const createProfessionalProfile = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User ID is not available' };
    }

    // Ensure user is verified before proceeding
    if (!userVerified || !sessionRefreshed) {
      console.log('Verifying user before profile creation...');
      const verified = await verifyUserExists();
      if (!verified) {
        return { success: false, error: 'User verification failed' };
      }
      setUserVerified(true);
    }

    let retries = 0;
    const MAX_RETRIES = 3;
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`Attempt ${retries + 1} to create/update profile for user:`, user.id);
        
        // Check if user exists in auth.users first
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error('Auth user not found:', authError);
          return { success: false, error: 'Authentication error. Please log in again.' };
        }
        
        if (authUser.id !== user.id) {
          console.error('User ID mismatch between auth and local state');
          return { success: false, error: 'Session mismatch. Please log in again.' };
        }
        
        // Use the ensureUserProfile utility function with error handling
        const result = await ensureUserProfile(user.id, 'professional');
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create/update profile');
        }
        
        // Update additional professional fields
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
            
            // If it's a foreign key error, provide specific guidance
            if (updateError.message.includes('foreign key') || updateError.message.includes('fkey')) {
              throw new Error('Profile creation failed due to authentication timing. Please refresh the page and try again.');
            }
            
            // For other schema issues, try minimal update
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
          // Continue anyway if base profile was created
        }
        
        // Initialize onboarding progress if supported
        if (!schemaStatus || schemaStatus.compatible || 
            !schemaStatus.missingColumns.includes('profiles.onboarding_progress')) {
          try {
            console.log('Initializing onboarding_progress');
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
          }
        } else {
          console.warn('Skipping onboarding_progress initialization - column missing in this environment');
        }
        
        return { success: true };
      } catch (err: any) {
        console.error(`Attempt ${retries + 1} failed:`, err);
        retries++;
        
        // If it's a foreign key constraint error, provide specific guidance
        if (err.message && err.message.includes('foreign key')) {
          return { 
            success: false, 
            error: 'Profile creation failed due to authentication timing. Please refresh the page and try again, or log out and log back in.'
          };
        }
        
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

    if (!userVerified) {
      toast.error("Please wait while we verify your authentication...");
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

  const handleRefreshSession = async () => {
    try {
      setUserVerified(false);
      setSessionRefreshed(false);
      const verified = await verifyUserExists();
      if (verified) {
        toast.success("Session refreshed successfully!");
      }
    } catch (error) {
      toast.error("Failed to refresh session. Please log in again.");
      navigate('/auth');
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
        <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking database connection...
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Database connection error. Your profile cannot be saved at this time.
        </div>
      )}
      
      {!userVerified && user && (
        <div className="mb-4 p-4 bg-amber-50 text-amber-700 rounded-md flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying authentication...
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshSession}
            className="ml-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Session
          </Button>
        </div>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          <h3 className="font-medium mb-2">✅ Registration Progress</h3>
          <ul className="text-sm space-y-1">
            <li>✓ Email verified</li>
            <li>✓ Account created</li>
            <li className="font-medium">→ Creating professional profile...</li>
          </ul>
        </div>
        
        <p className="text-gray-600">
          Clicking "Complete Registration" will create your professional profile and redirect you to your dashboard.
        </p>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || connectionStatus !== 'connected' || !userVerified}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Profile...
            </>
          ) : (
            'Complete Registration'
          )}
        </Button>
        
        {!userVerified && (
          <p className="text-sm text-gray-500 text-center">
            Please wait while we verify your authentication before proceeding.
          </p>
        )}
      </form>
    </div>
  );
};

export default ProfessionalRegistrationFix;
