import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  ClipboardList,
  BookOpen,
  Sparkles,
  Pill,
  UtensilsCrossed,
  ShoppingBasket,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * Surfaces the value families receive on the FREE plan — before any Day 0
 * payment. Demonstrates that prospects can register, build their profile,
 * see auto-matches, and document care plans at zero cost. Day 0 fees layer
 * a human concierge (Care Administrator) on top of the auto-matching system.
 */
export const FreePlanValueCard: React.FC = () => {
  return (
    <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground">Before Day 0</Badge>
              What families get for free — no payment required
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              One of our families recently registered, completed their care assessment, captured
              their loved one's <strong className="text-foreground">Legacy Story</strong>, drafted
              a care plan, and reviewed their <strong className="text-foreground">auto-generated
              caregiver matches</strong> — all before paying a cent. We want every prospect to
              experience the platform's value first.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <FreeFeature icon={ClipboardList} label="Profile & care preferences" />
          <FreeFeature icon={Heart} label="Care needs assessment" />
          <FreeFeature icon={BookOpen} label="Legacy Story capture" />
          <FreeFeature icon={Sparkles} label="Auto-matched caregivers" />
          <FreeFeature icon={Pill} label="Medication documentation" />
          <FreeFeature icon={UtensilsCrossed} label="Meal documentation" />
          <FreeFeature icon={ShoppingBasket} label="Grocery list documentation" />
          <FreeFeature icon={MessageCircle} label="Unlimited platform chat" />
        </div>

        {/* The bridge: auto-matching → Day 0 concierge */}
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowRight className="h-4 w-4" />
            Why Day 0 fees? The human concierge layer
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Auto-matching is <strong className="text-foreground">free and automatic</strong> —
            similar to how a dating app surfaces compatible profiles. The Day 0
            <strong className="text-foreground"> Caregiver Matching &amp; Placement</strong> ($1,399) and
            <strong className="text-foreground"> Care Assessment & Setup</strong> ($499) fees pay
            for the human Care Administrator who:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 pl-4">
            <li>• Refines and ranks the auto-matches against your specific household needs</li>
            <li>• Conducts pre-placement interviews with shortlisted caregivers</li>
            <li>• Mediates the back-and-forth until both family and caregiver are confident</li>
            <li>• Handles the formal introduction, onboarding, and care team build-out</li>
          </ul>
          <p className="text-xs text-muted-foreground italic">
            Think of free auto-matching as the dating-app match list. Day 0 is the personal
            matchmaker who interviews everyone and confirms the fit before anyone moves in.
          </p>
        </div>

        {/* Note on documentation vs tracking */}
        <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">A note on free vs paid features:</strong> The free
          plan lets families <em>document</em> medications, meals, and grocery lists — capturing
          what's needed and recording history. <strong className="text-foreground">Active</strong>
          {' '}and <strong className="text-foreground">Premium</strong> Care Management subscriptions
          add real-time <em>tracking</em>, nurse-administered medication logging, conflict
          detection, structured meal planning, and supply coordination.
        </div>
      </CardContent>
    </Card>
  );
};

const FreeFeature: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string }> = ({
  icon: Icon,
  label,
}) => (
  <div className="flex items-start gap-2 rounded-md border bg-background p-2">
    <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
    <span className="text-xs leading-tight">{label}</span>
  </div>
);
