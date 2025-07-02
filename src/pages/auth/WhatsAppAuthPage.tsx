
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { UserRole } from "@/types/database";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WhatsAppAuthPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [role, setRole] = useState<UserRole>("family");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [formattedNumber, setFormattedNumber] = useState("");
  const [devCode, setDevCode] = useState(""); // For development
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roleFromUrl = searchParams.get('role') as UserRole;
    if (roleFromUrl && ['family', 'professional', 'community', 'admin'].includes(roleFromUrl)) {
      setRole(roleFromUrl);
    }
  }, [searchParams]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsLoading(true);
    setErrorDetails("");
    
    try {
      console.log('Sending verification code to:', phoneNumber, 'with role:', role);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-auth-send-code', {
        body: {
          phoneNumber: phoneNumber.trim(),
          role: role,
          countryCode: '1'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        setErrorDetails(`Function error: ${error.message}`);
        toast.error("Failed to send verification code. Please check your connection and try again.");
        return;
      }

      console.log('Send code response:', data);
      
      if (data.success) {
        setFormattedNumber(data.formatted_number);
        setIsDevelopmentMode(!!data.warning);
        
        if (data.dev_code) {
          setDevCode(data.dev_code);
          toast.success(`Code sent! (Dev mode: ${data.dev_code})`);
        } else {
          toast.success("Verification code sent via WhatsApp!");
        }
        setStep("verify");
      } else {
        setErrorDetails(data.error || "Unknown error occurred");
        toast.error(data.error || "Failed to send verification code");
      }
    } catch (error: any) {
      console.error("Network error:", error);
      setErrorDetails(`Network error: ${error.message}`);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setErrorDetails("");
    
    try {
      console.log('Verifying code:', verificationCode, 'for phone:', phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-auth-verify-code', {
        body: {
          phoneNumber: phoneNumber.trim(),
          verificationCode: verificationCode.trim(),
          role: role
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        setErrorDetails(`Function error: ${error.message}`);
        toast.error("Failed to verify code. Please try again.");
        return;
      }

      console.log('Verify code response:', data);

      if (data.success) {
        toast.success("Phone number verified successfully!");
        
        // If we have a session URL, redirect to it for automatic login
        if (data.session_url) {
          console.log('Redirecting to session URL:', data.session_url);
          window.location.href = data.session_url;
        } else {
          // Fallback: redirect to appropriate dashboard
          const dashboardRoutes: Record<UserRole, string> = {
            'family': '/dashboard/family',
            'professional': '/dashboard/professional',
            'community': '/dashboard/community',
            'admin': '/dashboard/admin'
          };
          navigate(dashboardRoutes[role]);
        }
      } else {
        setErrorDetails(data.error || "Verification failed");
        toast.error(data.error || "Invalid verification code");
      }
    } catch (error: any) {
      console.error("Network error:", error);
      setErrorDetails(`Network error: ${error.message}`);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "verify") {
      setStep("phone");
      setVerificationCode("");
      setErrorDetails("");
    } else {
      navigate("/auth");
    }
  };

  const handleRetry = () => {
    setErrorDetails("");
    if (step === "verify") {
      setStep("phone");
      setVerificationCode("");
    }
  };

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                WhatsApp Authentication
              </CardTitle>
              <CardDescription>
                {step === "phone" 
                  ? "Enter your phone number to receive a verification code via WhatsApp"
                  : "Enter the verification code sent to your WhatsApp"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorDetails && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Error:</strong> {errorDetails}
                <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isDevelopmentMode && step === "verify" && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> WhatsApp API not configured. 
                {devCode && <span className="block font-mono mt-1">Code: {devCode}</span>}
              </AlertDescription>
            </Alert>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500">
                  Include your country code (e.g., +1 for US)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={isLoading}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="professional">Care Professional</SelectItem>
                    <SelectItem value="community">Community Member</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send verification code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
                <p className="text-sm text-gray-500">
                  Check your WhatsApp for the verification code
                  {devCode && (
                    <span className="block mt-1 text-blue-600 font-mono">
                      Dev code: {devCode}
                    </span>
                  )}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {formattedNumber || phoneNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Account Type:</strong> {role === "admin" ? "Administrator" : role.charAt(0).toUpperCase() + role.slice(1)}
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify and Sign In"
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setStep("phone");
                  setVerificationCode("");
                  setDevCode("");
                  setErrorDetails("");
                }}
                disabled={isLoading}
              >
                Use different phone number
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Tavara &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
    </div>
  );
}
