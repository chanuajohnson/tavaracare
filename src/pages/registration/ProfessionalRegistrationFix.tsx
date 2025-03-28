
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ensureUserProfile } from '@/lib/profile-utils';

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
        
        if (!user?.id) {
          throw new Error('User ID is not available');
        }
        
        // Use the ensureUserProfile utility function
        const result = await ensureUserProfile(user.id, 'professional');
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update profile');
        }
        
        // Update additional professional fields
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            professional_type: 'Healthcare Professional',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) {
          throw new Error(`Failed to update professional details: ${updateError.message}`);
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
