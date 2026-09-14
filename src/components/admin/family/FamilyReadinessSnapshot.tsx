/**
 * Coordinator-facing readiness snapshot.
 *
 * Shows each dimension independently. There is no combined score, no ranking,
 * and no judgement language. Constraints are shown as instructions to follow.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, ShieldCheck, Clock, MessageSquare, Home, Wallet } from "lucide-react";
import { useFamilyReadiness } from "@/hooks/family/useFamilyReadiness";
import {
  JOURNEY_LABELS,
  PRIOR_EXPERIENCE_LABELS,
  COMFORT_LABELS,
  CAPACITY_LABELS,
  LEVEL_LABELS,
  COMMUNICATION_LABELS,
  WINDOW_LABELS,
  MANAGEMENT_LABELS,
  COST_LABELS,
  PRIVACY_SELECTION_LABELS,
  END_REASON_LABELS,
} from "@/data/familyReadinessAssessment";
import { PACE_SUPPORT_LABEL } from "@/lib/family/readinessRules";

interface Props {
  profileId: string;
  familyName?: string;
}

const Row: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | null;
  note?: string;
}> = ({ icon: Icon, label, value, note }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden />
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value ?? "Not shared yet"}</p>
      {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
    </div>
  </div>
);

export const FamilyReadinessSnapshot: React.FC<Props> = ({ profileId, familyName }) => {
  const { profile, decisions, isLoading } = useFamilyReadiness(profileId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading readiness snapshot...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            Readiness snapshot{familyName ? ` — ${familyName}` : ""}
          </CardTitle>
          {decisions.paceSupportRequired && (
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              {PACE_SUPPORT_LABEL}
            </Badge>
          )}
        </div>
        {!decisions.hasProfile && (
          <p className="text-xs text-muted-foreground">
            No readiness answers yet. Cautious defaults are being applied.
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-1">
        <Row
          icon={Clock}
          label="Where they are now"
          value={
            decisions.journeyStage ? JOURNEY_LABELS[decisions.journeyStage] : undefined
          }
        />
        <Row
          icon={ShieldCheck}
          label="Previous care experience"
          value={
            decisions.priorExperience
              ? PRIOR_EXPERIENCE_LABELS[decisions.priorExperience]
              : undefined
          }
          note={
            profile?.prior_arrangement_end_reasons?.length
              ? `Ended because: ${profile.prior_arrangement_end_reasons
                  .map((r) => END_REASON_LABELS[r] ?? r)
                  .join(", ")}`
              : undefined
          }
        />
        <Row
          icon={Info}
          label="Comfort with outside help"
          value={
            profile?.outside_care_comfort
              ? COMFORT_LABELS[profile.outside_care_comfort]
              : undefined
          }
        />
        <Row
          icon={Info}
          label="Information capacity"
          value={CAPACITY_LABELS[decisions.informationCapacity]}
          note={`Show at most ${decisions.maxNonUrgentRecommendations} non-urgent recommendation${
            decisions.maxNonUrgentRecommendations === 1 ? "" : "s"
          } at a time.`}
        />
        <Row
          icon={ShieldCheck}
          label="Privacy sensitivity"
          value={LEVEL_LABELS[decisions.trustPrivacy]}
          note={
            profile?.privacy_selections?.length
              ? profile.privacy_selections
                  .map((s) => PRIVACY_SELECTION_LABELS[s] ?? s)
                  .join(" · ")
              : undefined
          }
        />
        <Row
          icon={Home}
          label="Home change"
          value={LEVEL_LABELS[decisions.homeChangeReadiness]}
          note={
            decisions.homeRecommendationsSafetyOnly
              ? "Safety-critical items only. No optional home suggestions."
              : decisions.showHomeEnvironmentRecommendations
                ? "Home suggestions may be shared."
                : undefined
          }
        />
        <Row
          icon={MessageSquare}
          label="How they want to be reached"
          value={
            profile?.management_preference
              ? MANAGEMENT_LABELS[profile.management_preference]
              : undefined
          }
          note={`Send action-required items on: ${decisions.deliveryChannels.join(", ")}`}
        />
        <Row
          icon={Clock}
          label="Update cadence"
          value={
            profile?.communication_frequency
              ? COMMUNICATION_LABELS[profile.communication_frequency]
              : undefined
          }
          note={
            profile?.communication_window
              ? `Best time: ${WINDOW_LABELS[profile.communication_window]}`
              : undefined
          }
        />
        <Row
          icon={Wallet}
          label="How they want cost presented"
          value={COST_LABELS[decisions.costPreference]}
          note={
            decisions.showOptionalServices
              ? undefined
              : "Do not show optional add-on services."
          }
        />

        {decisions.guidance.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Coordination guidance
              </p>
              <ul className="space-y-1.5">
                {decisions.guidance.map((g, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {decisions.discrepancies.length > 0 && (
          <>
            <Separator className="my-3" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Things to check (internal only)
              </p>
              <ul className="space-y-1.5">
                {decisions.discrepancies.map((d, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span>•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {profile?.assessed_at && (
          <p className="text-xs text-muted-foreground pt-3">
            Last updated {new Date(profile.assessed_at).toLocaleDateString()}
            {profile.last_source ? ` (${profile.last_source.replace(/_/g, " ")})` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
