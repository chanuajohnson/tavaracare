
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const ProfessionalRegistrationFix = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Checking Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
          toast.error(`Database connection error: ${error.message}`);
        } else {
          console.log('Successfully connected to Supabase:', data);
          setConnectionStatus('connected');
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
        
        // Get the current session to ensure we're authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error before profile update:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData.session) {
          console.error('No active session found');
          throw new Error('No active session found. Please sign in again.');
        }
        
        console.log('Active session found:', sessionData.session.user.id);
        
        // First check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .maybeSingle();
          
        if (profileCheckError) {
          console.error('Error checking existing profile:', profileCheckError);
          throw new Error(`Profile check error: ${profileCheckError.message}`);
        }
        
        let updateResult;
        
        if (!existingProfile) {
          console.log('Profile does not exist, creating new profile');
          updateResult = await supabase
            .from('profiles')
            .insert([{
              id: user?.id,
              role: 'professional',
              full_name: user?.user_metadata?.full_name || 'Professional User',
              professional_type: 'Healthcare Professional',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
        } else {
          console.log('Existing profile found, updating:', existingProfile);
          updateResult = await supabase
            .from('profiles')
            .update({ 
              role: 'professional',
              professional_type: 'Healthcare Professional',
              updated_at: new Date().toISOString()
            })
            .eq('id', user?.id);
        }
        
        if (updateResult.error) {
          console.error('Profile update error:', updateResult.error);
          throw new Error(`Profile update error: ${updateResult.error.message}`);
        }
        
        console.log('Profile update successful:', updateResult.data);
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
      console.log('Starting professional profile creation for user:', user.id);
      
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields would go here */}
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
