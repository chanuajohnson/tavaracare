
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

interface CareEnvironmentJourneyStepContentProps {
  isMandatory?: boolean;
  onContactCoordinator?: () => void;
}

export const CareEnvironmentJourneyStepContent = ({ 
  isMandatory = false,
  onContactCoordinator
}: CareEnvironmentJourneyStepContentProps) => {
  const tiers = [
    {
      level: 1,
      label: "Care Readiness Assessment",
      price: "$199",
      billing: "one-time",
      description: "A professional walkthrough of your home to identify adjustments that support safe, comfortable caregiving.",
      icon: Home,
      included: true
    },
    {
      level: 2,
      label: "Guided Home Reset",
      price: "$499",
      billing: "one-time",
      description: "Hands-on coordination to reorganize and prepare key areas for your care team's daily workflow.",
      icon: Sparkles,
      included: false
    },
    {
      level: 3,
      label: "Full Care Environment Reset",
      price: "Custom",
      billing: "quote-based",
      description: "Comprehensive environment transition with vendor coordination, decluttering support, and space optimization.",
      icon: ShieldCheck,
      included: false
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
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Included with care
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tier.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-semibold">{tier.price}</span>
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
