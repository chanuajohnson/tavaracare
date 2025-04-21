
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
        // Extract token from URL
        const { token, type } = extractResetTokens();
        console.log("🔑 Reset token extracted:", { 
          hasToken: !!token,
          type 
        });
        
        if (!token || type !== "recovery") {
          console.error("❌ Invalid reset token:", { hasToken: !!token, type });
          setStatus("invalid");
          toast.error("Invalid or expired reset link");
          return;
        }

        // Verify the token using the tokenHash method
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery"
        });

        if (error || !data?.user) {
          console.error("❌ Error verifying recovery token:", error);
          setStatus("invalid");
          toast.error(error?.message || "Invalid or expired reset link");
          clearAuthTokens();
          return;
        }

        console.log("✅ Recovery token verified successfully");
        setStatus("ready");
        setEmail(data.user.email);
        clearAuthTokens();
        
      } catch (err: any) {
        console.error('❌ Error in init:', err);
        setStatus("invalid");
        toast.error(err.message || "Invalid reset link");
        clearAuthTokens();
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
