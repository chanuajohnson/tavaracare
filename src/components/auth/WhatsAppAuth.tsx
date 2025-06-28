
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppAuthProps {
  onSuccess: (authUrl: string) => void;
  onBack: () => void;
}

const countryCodes = [
  { code: '868', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '1', name: 'United States/Canada', flag: '🇺🇸' },
  { code: '44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '91', name: 'India', flag: '🇮🇳' },
  { code: '86', name: 'China', flag: '🇨🇳' },
  { code: '33', name: 'France', flag: '🇫🇷' },
  { code: '49', name: 'Germany', flag: '🇩🇪' },
  { code: '55', name: 'Brazil', flag: '🇧🇷' },
  { code: '81', name: 'Japan', flag: '🇯🇵' },
  { code: '61', name: 'Australia', flag: '🇦🇺' },
];

export const WhatsAppAuth: React.FC<WhatsAppAuthProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState<'phone' | 'verify' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('868');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const getPhoneNumberPlaceholder = () => {
    switch (countryCode) {
      case '868':
        return 'e.g., 756-0967 or 7560967';
      case '1':
        return 'e.g., 555-123-4567';
      default:
        return 'Your phone number';
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setErrorDetails(null);
    
    try {
      console.log('Attempting to send verification code for:', { phoneNumber, countryCode });
      
      // First, check if Supabase client is properly configured
      const { data: testConnection } = await supabase.from('profiles').select('id').limit(1);
      console.log('Supabase connection test:', testConnection ? 'SUCCESS' : 'FAILED');
      
      // Get current session to verify auth context
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current auth session:', sessionData?.session ? 'EXISTS' : 'NONE');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: {
          action: 'send_verification',
          phone_number: phoneNumber,
          country_code: countryCode
        }
      });

      console.log('Function invoke response:', { data, error });

      if (error) {
        console.error('Supabase function error details:', {
          message: error.message,
          context: error.context,
          details: error.details
        });
        
        // Provide specific error messages based on error type
        if (error.message?.includes('fetch')) {
          toast.error('Network connection failed. Please check your internet connection and try again.');
        } else if (error.message?.includes('Failed to invoke')) {
          toast.error('Service temporarily unavailable. Please try again in a moment.');
        } else {
          toast.error(`Network error: ${error.message || 'Unable to connect to verification service'}`);
        }
        return;
      }

      if (data?.success) {
        setFormattedNumber(data.formatted_number);
        setStep('verify');
        toast.success(`Verification code sent to ${data.formatted_number}!`);
        
        // Show debug code in development
        if (data.debug_code) {
          toast.info(`Debug: Your code is ${data.debug_code}`, { 
            duration: 15000,
            description: 'This debug info will not appear in production'
          });
        }
      } else {
        console.error('Verification failed:', data);
        setErrorDetails(data?.debug_info);
        
        // Show specific error messages based on error type
        switch (data?.error_type) {
          case 'formatting_error':
          case 'invalid_format':
            toast.error(data.error || 'Invalid phone number format', {
              description: data.debug_info?.suggestion || 'Please check your phone number and try again'
            });
            break;
          case 'validation_error':
            toast.error(data.error || 'Please enter a valid phone number');
            break;
          case 'database_error':
            toast.error('System error. Please try again in a moment.');
            break;
          default:
            toast.error(data?.error || 'Failed to send verification code');
        }
      }
    } catch (error: any) {
      console.error('Verification error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Enhanced error messages for common network issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Connection failed - please check your internet connection');
      } else if (error.message?.includes('CORS')) {
        toast.error('Cross-origin request blocked - please try refreshing the page');
      } else if (error.message?.includes('timeout')) {
        toast.error('Request timed out - please try again');
      } else {
        toast.error(`Connection error: ${error.message || 'Unable to reach verification service'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: {
          action: 'verify_code',
          phone_number: phoneNumber,
          verification_code: verificationCode
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error('Network error. Please try again.');
        return;
      }

      if (data?.success) {
        setSessionToken(data.session_token);
        await linkOrCreateUser(data.session_token);
      } else {
        switch (data?.error_type) {
          case 'verification_failed':
            toast.error('Invalid or expired code', {
              description: 'Please request a new verification code'
            });
            break;
          case 'validation_error':
            toast.error(data.error || 'Please enter a valid verification code');
            break;
          default:
            toast.error(data?.error || 'Invalid verification code');
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const linkOrCreateUser = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-auth', {
        body: {
          action: 'create_or_link_user',
          session_token: token,
          user_metadata: {
            phone: formattedNumber,
            country_code: countryCode
          }
        }
      });

      if (error) {
        console.error('Auth function error:', error);
        toast.error('Authentication error. Please try again.');
        return;
      }

      if (data?.success) {
        toast.success(data.user_exists ? 'Welcome back!' : 'Account created successfully!');
        onSuccess(data.auth_url);
      } else {
        toast.error(data?.error || 'Failed to complete authentication');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Failed to complete authentication. Please try again.');
    }
  };

  const renderPhoneStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <MessageCircle className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle>Sign in with WhatsApp</CardTitle>
        <CardDescription>
          Enter your WhatsApp number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger id="country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.flag} +{country.code} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex">
            <div className="px-3 py-2 bg-muted rounded-l-md border border-r-0">
              +{countryCode}
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder={getPhoneNumberPlaceholder()}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="rounded-l-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll send a verification code to this number via WhatsApp
          </p>
          {countryCode === '868' && (
            <p className="text-xs text-blue-600">
              Trinidad users: Enter just the 7-digit number (e.g., 7560967) or full format (868-756-0967)
            </p>
          )}
        </div>

        {errorDetails && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="text-red-800 font-medium">Formatting Help:</p>
                <p className="text-red-700 mt-1">{errorDetails?.suggestion}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={sendVerificationCode} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full">
            Back to Sign In Options
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderVerifyStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {formattedNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>

        <div className="space-y-2">
          <Button 
            onClick={verifyCode} 
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          <Button variant="ghost" onClick={() => setStep('phone')} className="w-full">
            Change Phone Number
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={sendVerificationCode}
            disabled={isLoading}
            className="text-sm"
          >
            Didn't receive the code? Resend
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4">
      {step === 'phone' && renderPhoneStep()}
      {step === 'verify' && renderVerifyStep()}
    </div>
  );
};
