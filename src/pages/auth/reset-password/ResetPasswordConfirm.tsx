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
    // Parse tokens from hash in URL
    const { accessToken, refreshToken, type } = extractResetTokens();
    if (!accessToken || !refreshToken || type !== "recovery") {
      setStatus("invalid");
      return;
    }

    // Set skipPostLoginRedirect flag before starting session
    sessionStorage.setItem('skipPostLoginRedirect', 'true');
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ data, error }) => {
      if (error || !data.session) {
        setStatus("invalid");
        toast.error("Invalid or expired reset link.");
        clearAuthTokens();
        sessionStorage.removeItem('skipPostLoginRedirect');
        return;
      }
      setStatus("ready");
      setEmail(data.session.user.email);
      clearAuthTokens();
    });
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
    // Clear skipPostLoginRedirect once success UI is shown
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
              setTimeout(() => {
                // Just in case: ensure flag is cleared on redirect.
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
          Password updated successfully. Redirecting…
        </div>
      )}
    </div>
  );
}
