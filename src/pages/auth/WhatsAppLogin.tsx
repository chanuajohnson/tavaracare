
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, MessageCircle } from 'lucide-react';

const WhatsAppLogin = () => {
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !firstName || !lastName || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-verify', {
        body: {
          action: 'send_code',
          phone_number: phoneNumber,
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      });

      if (error) throw error;

      if (data.success) {
        setFormattedNumber(data.formatted_number);
        setStep('verification');
        toast.success('Verification code sent to your WhatsApp!');
      } else {
        throw new Error(data.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Send code error:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    
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
        // Set the session with the tokens
        if (data.access_token && data.refresh_token) {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          });
        }

        toast.success('Verification successful! Welcome to Tavara!');
        
        // Redirect based on role
        const dashboardRoutes = {
          family: '/dashboard/family',
          professional: '/dashboard/professional',
          community: '/dashboard/community'
        };
        
        const redirectPath = dashboardRoutes[role as keyof typeof dashboardRoutes] || '/';
        navigate(redirectPath);
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Verify code error:', error);
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 7) {
      return cleaned.replace(/(\d{3})(\d{4})/, '$1-$2');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <MessageCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Login</h1>
          <p className="text-gray-600 mt-2">Sign in with your WhatsApp number</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {step === 'verification' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('details')}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle>
                  {step === 'details' ? 'Your Details' : 'Verify Your Number'}
                </CardTitle>
                <CardDescription>
                  {step === 'details' 
                    ? 'Enter your information to get started'
                    : `Enter the code sent to ${formatPhoneDisplay(phoneNumber)}`
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'details' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a *</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">👨‍👩‍👧‍👦 Family Member (looking for care)</SelectItem>
                      <SelectItem value="professional">👩‍⚕️ Professional Caregiver</SelectItem>
                      <SelectItem value="community">🤝 Community Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">WhatsApp Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="e.g., 868-786-5357 or 7865357"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Enter your Trinidad & Tobago WhatsApp number
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <MessageCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-800">
                    Check your WhatsApp for a 6-digit verification code
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Sent to: {formattedNumber || formatPhoneDisplay(phoneNumber)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code *</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSendCode(new Event('submit') as any)}
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm text-gray-600"
              >
                Back to Email Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppLogin;
