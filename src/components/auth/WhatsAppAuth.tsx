
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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

  const sendVerificationCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: {
          action: 'send_verification',
          phone_number: phoneNumber,
          country_code: countryCode
        }
      });

      if (error) throw error;

      if (data.success) {
        setFormattedNumber(data.formatted_number);
        setStep('verify');
        toast.success('Verification code sent to your WhatsApp!');
        
        // Show debug code in development
        if (data.debug_code) {
          toast.info(`Debug: Your code is ${data.debug_code}`, { duration: 10000 });
        }
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
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

      if (error) throw error;

      if (data.success) {
        setSessionToken(data.session_token);
        await linkOrCreateUser(data.session_token);
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Failed to verify code');
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

      if (error) throw error;

      if (data.success) {
        toast.success(data.user_exists ? 'Welcome back!' : 'Account created successfully!');
        onSuccess(data.auth_url);
      } else {
        toast.error(data.error || 'Failed to authenticate');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Failed to complete authentication');
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
              placeholder={countryCode === '868' ? 'XXX-XXXX' : 'Your phone number'}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="rounded-l-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll send a verification code to this number via WhatsApp
          </p>
        </div>

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
            onChange={(e) => setVerificationCode(e.target.value)}
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
