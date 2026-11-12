import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/** Admin switch: has this family agreed to an anonymous social post about their care request? */
export const SocialConsentToggle: React.FC<{ userId: string; kind?: "family" | "professional" }> = ({ userId, kind = "family" }) =>
  {
  const col = kind === "family" ? "family_consent_social" : "professional_consent_social";
  return <Inner userId={userId} kind={kind} col={col} />;
};

const Inner: React.FC<{ userId: string; kind: string; col: string }> = ({ userId, kind, col }) => {
  const [on, setOn] = useState<boolean | null>(null);
  const [at, setAt] = useState<string | null>(null);

  useEffect(() => {
    (supabase as any).from("profiles").select(`${col}, consent_social_at`).eq("id", userId).maybeSingle()
      .then(({ data }: any) => { setOn(!!data?.[col]); setAt(data?.consent_social_at ?? null); });
  }, [userId]);

  const change = async (v: boolean) => {
    const when = v ? new Date().toISOString() : null;
    const { error } = await (supabase as any).from("profiles").update({ [col]: v, consent_social_at: when }).eq("id", userId);
    if (error) return toast.error("Could not save consent: " + error.message);
    setOn(v); setAt(when);
    toast.success(v ? "Can now be featured in Reel Studio." : "Removed from Reel Studio.");
  };

  if (on === null) return null;
  return (
    <Card>
      <CardContent className="flex items-start gap-3 py-4">
        <Switch id={`social-${userId}`} checked={on} onCheckedChange={change} />
        <div>
          <Label htmlFor={`social-${userId}`}>{kind === "family" ? "Family" : "Caregiver"} agreed to an anonymous social post</Label>
          <p className="text-xs text-muted-foreground">Only switch on after the family says yes. {kind === "family" ? "The reel shows area and care needs only" : "The reel shows area, skills and availability only, and they must be available for matching"}, never names or addresses.{at ? ` Agreed ${new Date(at).toLocaleDateString()}.` : ""}</p>
        </div>
      </CardContent>
    </Card>
  );
};
