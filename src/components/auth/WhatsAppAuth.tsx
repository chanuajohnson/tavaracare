
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Shield, AlertCircle, ExternalLink } from 'lucide-react';
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
  const [step, setStep] = useState<'phone' | 'whatsapp' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('868');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
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

  const generateWhatsAppLink = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setErrorDetails(null);
    
    try {
      console.log('Generating WhatsApp link for:', { phoneNumber, countryCode });
      
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: {
          action: 'send_verification',
          phone_number: phoneNumber,
          country_code: countryCode
        }
      });

      console.log('Function invoke response:', { data, error });

      if (error) {
        console.error('Supabase function error details:', error);
        toast.error(`Network error: ${error.message || 'Unable to connect to verification service'}`);
        return;
      }

      if (data?.success) {
        setFormattedNumber(data.formatted_number);
        setWhatsappUrl(data.whatsapp_url);
        setGeneratedCode(data.verification_code);
        setStep('whatsapp');
        toast.success(`WhatsApp link generated successfully!`);
      } else {
        console.error('Verification failed:', data);
        setErrorDetails(data?.debug_info);
        
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
            toast.error(data?.error || 'Failed to generate WhatsApp link');
        }
      }
    } catch (error: any) {
      console.error('Error generating WhatsApp link:', error);
      toast.error(`Connection error: ${error.message || 'Unable to reach verification service'}`);
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
              description: 'Please check the code you sent via WhatsApp'
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
          Enter your WhatsApp number to get started
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
            We'll generate a WhatsApp message for you to send to our business number
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
            onClick={generateWhatsAppLink} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating Link...' : 'Generate WhatsApp Link'}
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full">
            Back to Sign In Options
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderWhatsAppStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <MessageCircle className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle>Send Verification via WhatsApp</CardTitle>
        <CardDescription>
          Click the button below to open WhatsApp and send your verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Instructions:</h4>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. Click "Open WhatsApp" below</li>
            <li>2. Send the pre-filled message to our business number</li>
            <li>3. Come back here and enter your verification code</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label>Your verification code:</Label>
          <div className="p-3 bg-gray-100 rounded-md text-center font-mono text-lg">
            {generatedCode}
          </div>
          <p className="text-xs text-muted-foreground">
            Keep this code handy - you'll need to enter it after sending the WhatsApp message
          </p>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open WhatsApp
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setStep('verify')} 
            className="w-full"
          >
            I've sent the message - Enter Code
          </Button>
          <Button variant="ghost" onClick={() => setStep('phone')} className="w-full">
            Change Phone Number
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
          Enter the 6-digit code you sent via WhatsApp to {formattedNumber}
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
          <p className="text-xs text-muted-foreground">
            This should match the code from your WhatsApp message: {generatedCode}
          </p>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={verifyCode} 
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          <Button variant="ghost" onClick={() => setStep('whatsapp')} className="w-full">
            Back to WhatsApp Step
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setStep('phone')}
            className="text-sm"
          >
            Need to generate a new code?
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4">
      {step === 'phone' && renderPhoneStep()}
      {step === 'whatsapp' && renderWhatsAppStep()}
      {step === 'verify' && renderVerifyStep()}
    </div>
  );
};
