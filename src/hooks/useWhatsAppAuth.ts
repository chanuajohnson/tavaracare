
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WhatsAppSession {
  id: string;
  phone_number: string;
  session_token: string;
  user_id?: string;
  expires_at: string;
  is_active: boolean;
}

export const useWhatsAppAuth = () => {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateSession = async (sessionToken: string) => {
    setIsLoading(true);
    try {
      console.log('Validating WhatsApp session token:', sessionToken);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-auth', {
        body: {
          action: 'validate_session',
          session_token: sessionToken
        }
      });

      console.log('Session validation response:', { data, error });

      if (error) {
        console.error('Session validation error:', error);
        throw error;
      }

      if (data?.success) {
        setSession(data.session);
        return data.session;
      } else {
        console.log('Session validation failed:', data?.error);
        setSession(null);
        return null;
      }
    } catch (error: any) {
      console.error('Session validation error:', {
        message: error.message,
        stack: error.stack
      });
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    console.log('Clearing WhatsApp session');
    setSession(null);
    localStorage.removeItem('whatsapp_session_token');
  };

  // Check for stored session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('whatsapp_session_token');
    if (storedToken) {
      console.log('Found stored WhatsApp session token, validating...');
      validateSession(storedToken);
    }
  }, []);

  const authenticateWithWhatsApp = async (authUrl: string) => {
    try {
      console.log('Authenticating with WhatsApp using URL:', authUrl);
      // Navigate to the auth URL to complete Supabase authentication
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('WhatsApp authentication error:', error);
      toast.error('Failed to complete authentication');
    }
  };

  return {
    session,
    isLoading,
    validateSession,
    clearSession,
    authenticateWithWhatsApp
  };
};
