
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { useFamilyStage } from "@/hooks/useFamilyStage";

interface CareEnvironmentJourneyStepContentProps {
  isMandatory?: boolean;
  onContactCoordinator?: () => void;
}

export const CareEnvironmentJourneyStepContent = ({ 
  isMandatory = false,
  onContactCoordinator
}: CareEnvironmentJourneyStepContentProps) => {
  // Stage gating: don't surface the home reset upsell to families who are
  // still in Entry/Overwhelm (1) or Settling/Trust Forming (2) — only show
  // it once they've signaled readiness (3) or optimization (4). Mandatory
  // safety cases always bypass this gate so we never hide critical guidance.
  const { stage, isLoading: stageLoading } = useFamilyStage();
  if (!isMandatory && !stageLoading && stage < 3) {
    return null;
  }

  const tiers = [
    {
      level: 1,
      label: "Care Readiness Assessment",
      price: "$0",
      originalPrice: "$199",
      billing: "waived",
      description: "Structured home walkthrough, caregiver workflow mapping, hygiene and safety assessment, decluttering recommendations, and space optimization plan. Provided as part of your care onboarding.",
      icon: Home,
    },
    {
      level: 2,
      label: "Guided Home Reset",
      price: "$499",
      originalPrice: null,
      billing: "one-time coordination fee",
      description: "Decluttering the space, lightening the home, and addressing hygiene concerns. Tavara coordinates and guides this process — the $499 covers our hands-on coordination until completion. External contractor costs are quoted separately.",
      icon: Sparkles,
    },
    {
      level: 3,
      label: "Full Care Environment Reset",
      price: "Custom",
      originalPrice: null,
      billing: "ongoing / quote-based",
      description: "Ongoing care environment support — including recurring pest control coordination, contractor management, and sustained home readiness. Continued oversight for monthly pest control, seasonal deep cleaning, and evolving environmental needs.",
      icon: ShieldCheck,
    }
  ];

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center gap-2 mb-2">
        {isMandatory ? (
          <Badge variant="destructive" className="text-xs gap-1">
            <AlertTriangle className="h-3 w-3" />
            Health & Safety Priority
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs gap-1">
            <Sparkles className="h-3 w-3" />
            Recommended
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground leading-relaxed">
        {isMandatory 
          ? "Your care team has identified aspects of the home environment that need attention for safe caregiving. We'll coordinate and manage this process for you."
          : "As part of this care transition, we can help prepare your home to support your loved one's comfort and your care team's workflow."
        }
      </p>

      <div className="grid gap-2">
        {tiers.map((tier) => (
          <Card key={tier.level} className={`border ${tier.level === 1 ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <tier.icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{tier.label}</span>
                      {tier.level === 1 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-300 text-green-700">
                          Waived
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tier.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold">{tier.price}</span>
                  {tier.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through ml-1">{tier.originalPrice}</span>
                  )}
                  <p className="text-[10px] text-muted-foreground">{tier.billing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {onContactCoordinator && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs mt-2 gap-1"
          onClick={onContactCoordinator}
        >
          Discuss with Care Coordinator
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}

      <p className="text-[10px] text-muted-foreground italic">
        Tavara coordinates and manages this process — we connect you with trusted service partners and oversee every step.
      </p>
    </div>
  );
};
