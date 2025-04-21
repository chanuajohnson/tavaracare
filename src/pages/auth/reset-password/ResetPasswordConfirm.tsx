
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { extractResetTokens, clearAuthTokens } from "@/utils/authResetUtils";
import { toast } from "sonner";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "invalid" | "ready" | "success">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      console.log("⚙️ ResetPasswordConfirm: Initializing password reset confirmation");
      
      try {
        // Extract tokens from URL
        const { accessToken, refreshToken, type } = extractResetTokens();
        console.log("🔑 Reset tokens extracted:", { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });
        
        if (!accessToken || !refreshToken || type !== "recovery") {
          console.error("❌ Invalid reset tokens:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
          setStatus("invalid");
          toast.error("Invalid or expired reset link");
          return;
        }

        // Set skipPostLoginRedirect flag before starting session
        sessionStorage.setItem('skipPostLoginRedirect', 'true');
        
        try {
          console.log("🔄 Setting session with recovery tokens");
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error || !data.session) {
            console.error("❌ Error setting recovery session:", error);
            setStatus("invalid");
            toast.error(error?.message || "Invalid or expired reset link");
            clearAuthTokens();
            sessionStorage.removeItem('skipPostLoginRedirect');
            return;
          }

          console.log("✅ Recovery session established successfully");
          setStatus("ready");
          setEmail(data.session.user.email);
          clearAuthTokens();
        } catch (err) {
          console.error('❌ Error in recovery session processing:', err);
          setStatus("invalid");
          toast.error("Failed to process reset link");
          clearAuthTokens();
          sessionStorage.removeItem('skipPostLoginRedirect');
        }
      } catch (err: any) {
        console.error('❌ Error in init:', err);
        setStatus("invalid");
        toast.error(err.message || "Invalid reset link");
        clearAuthTokens();
        sessionStorage.removeItem('skipPostLoginRedirect');
      }
    };

    init();
  }, []);

  if (status === "loading") {
    return (
      <div className="container max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verifying Link…</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Please wait…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="container max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Link Invalid or Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground mb-4">
              <p>The password reset link is not valid or has expired.</p>
            </div>
            <button
              onClick={() => navigate("/auth/reset-password")}
              className="w-full py-2 rounded bg-primary text-white"
            >
              Request New Link
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    sessionStorage.removeItem('skipPostLoginRedirect');
  }

  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Set a New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm
            onSuccess={() => {
              setStatus("success");
              toast.success("Password updated successfully");
              setTimeout(() => {
                sessionStorage.removeItem('skipPostLoginRedirect');
                navigate("/auth");
              }, 2000);
            }}
            email={email ?? ""}
          />
        </CardContent>
      </Card>
      {status === "success" && (
        <div className="mt-4 text-center text-green-600">
          Password updated successfully. Redirecting...
        </div>
      )}
    </div>
  );
}
