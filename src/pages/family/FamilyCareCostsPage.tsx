import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Heart, Info, Lock, MessageCircle, Calculator, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLifecycleCost } from '@/hooks/admin/useLifecycleCost';
import { fmtTTD } from '@/utils/lifecycleScenarios';

const CARE_TIERS = [
  {
    name: 'Standard Care',
    rate: 40,
    detail: 'Personal care, meals, mobility support, companionship and daily notes.',
  },
  {
    name: 'Full Service Care',
    rate: 45,
    detail: 'Everything in Standard, plus medication recording and closer daily monitoring.',
  },
  {
    name: 'Premium Care',
    rate: 50,
    detail: 'Higher-need support where a nurse-level skill set is needed on every shift.',
    plus: true,
  },
];

const BEGINNER_READS = [
  {
    slug: 'how-to-find-trusted-caregiver-trinidad-tobago',
    title: 'How to Find a Trusted Caregiver in Trinidad & Tobago',
    time: '8 min read',
    why: 'What to look for, what to ask, and what a proper match actually involves.',
  },
  {
    slug: 'senior-care-costs-trinidad-tobago-2026',
    title: 'Senior Care Costs in Trinidad & Tobago (2026 Guide)',
    time: '10 min read',
    why: 'Plain talk about what care costs here and what drives the difference.',
  },
  {
    slug: 'why-families-resist-care',
    title: "Why Families Resist Care at First. And Why That's Normal",
    time: '9 min read',
    why: 'If it still feels early or uncomfortable, start here.',
  },
];

export default function FamilyCareCostsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { pricing, isLoading } = useLifecycleCost();

  const [rate, setRate] = useState(40);
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(5);

  const weeklyCare = rate * hours * days;
  const weeklyCoordination = pricing.sub_active;
  const weeklyTotal = weeklyCare + weeklyCoordination;

  const setupTotal = useMemo(
    () => pricing.setup_assessment + pricing.setup_matching + pricing.setup_readiness,
    [pricing]
  );

  if (authLoading) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-lg py-16">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Please sign in</CardTitle>
            </div>
            <CardDescription>
              We share cost details privately with families we are working with, so this page needs
              you signed in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/auth?returnTo=/family/care-costs">Sign in to continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbItems={[
          { label: 'Family Dashboard', path: '/dashboard/family' },
          { label: 'Understanding Your Care Costs', path: '/family/care-costs' },
        ]}
      />

      <div className="container mx-auto max-w-4xl py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Understanding your care costs</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            No surprises. This page walks you through what is free, what you pay before care starts,
            and what a normal week looks like once your loved one has a caregiver in place.
          </p>
        </div>

        {/* Free first */}
        <Card>
          <CardHeader>
            <Badge className="w-fit mb-1">Free</Badge>
            <CardTitle className="text-lg">Before care begins, you pay nothing</CardTitle>
            <CardDescription>
              Registering, telling us about your loved one, your care assessment, your readiness
              check and seeing your first caregiver matches all cost nothing.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Care rates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Care rates, per hour</CardTitle>
            <CardDescription>
              Your rate depends on the level of care your loved one needs. We agree this with you
              before anyone starts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {CARE_TIERS.map((t) => (
              <div key={t.name} className="rounded-lg border p-4">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-2xl font-bold text-primary mt-1">
                  ${t.rate}
                  {t.plus ? '+' : ''}
                  <span className="text-xs font-normal text-muted-foreground"> /hour</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Setup */}
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-1">One time</Badge>
              <CardTitle className="text-lg">Setting up care, paid once before care starts</CardTitle>
              <CardDescription>
                This covers your full care assessment and setup, matching you with the right
                caregiver and placing them with your household, and your readiness review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <SetupRow label="Care assessment & setup" amount={pricing.setup_assessment} />
                <SetupRow label="Caregiver matching & placement" amount={pricing.setup_matching} />
                <SetupRow label="Care readiness review" amount={pricing.setup_readiness} />
                <div className="rounded-md border border-primary/30 bg-primary/10 p-3">
                  <div className="text-[11px] uppercase text-muted-foreground">Total to start</div>
                  <div className="text-lg font-bold text-primary">{fmtTTD(setupTotal)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly estimator */}
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">What a normal week looks like</CardTitle>
              </div>
              <CardDescription>
                Move the sliders to match the care you are thinking about. Shifts are a minimum of 8
                hours, so 8 is the smallest shift length here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SliderRow
                label="Care rate"
                value={`$${rate}/hour`}
                min={40}
                max={50}
                step={5}
                current={rate}
                onChange={setRate}
              />
              <SliderRow
                label="Hours per shift"
                value={`${hours} hours`}
                min={8}
                max={12}
                step={2}
                current={hours}
                onChange={setHours}
              />
              <SliderRow
                label="Days per week"
                value={`${days} ${days === 1 ? 'day' : 'days'}`}
                min={1}
                max={7}
                step={1}
                current={days}
                onChange={setDays}
              />

              <Separator />

              <div className="space-y-2 text-sm">
                <Line label={`Care, ${hours}h × ${days} days at $${rate}/hour`} amount={weeklyCare} />
                <Line label="Care coordination & management" amount={weeklyCoordination} />
                <div className="flex items-center justify-between rounded-md bg-primary/10 border border-primary/30 px-3 py-2">
                  <span className="font-medium">Your week</span>
                  <span className="text-lg font-bold text-primary">{fmtTTD(weeklyTotal)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  The care portion goes to your caregiver, coordinated by us on your behalf.
                  Coordination covers your care plan, schedule, daily logs, medication records,
                  cover when your caregiver is out, and your payment records. Amounts in TTD.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optional */}
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-1">Only if you want it</Badge>
            <CardTitle className="text-lg">Added only when you ask for it</CardTitle>
            <CardDescription>
              Nothing here is ever added to your bill automatically. If your loved one's needs
              change, we talk it through with you first and you decide.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>• Medication management support</p>
            <p>• Closer daily monitoring and written care routines</p>
            <p>• Meal support upgrade</p>
            <p>• Support for a second person in the household</p>
            <p>• Preparing the home for care, from a short assessment up to a guided reset</p>
          </CardContent>
        </Card>

        {/* Reads */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Three reads to start with</CardTitle>
            </div>
            <CardDescription>Short, written for families new to arranging care.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {BEGINNER_READS.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.why}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-1">{p.time}</div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Close */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 mt-0.5 text-primary" />
              <p className="text-sm text-muted-foreground">
                If any number here raises a question, bring it to your onboarding call. Nothing is
                agreed until you have seen it written down and said yes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/family/onboarding-checklist">Open your onboarding checklist</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/family">Back to your dashboard</Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tavara is a care coordination and management platform. Families engage caregivers
              directly, and we coordinate the match, the schedule and the payment records on your
              behalf. All amounts in TTD.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const SetupRow: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
  <div className="rounded-md border p-3">
    <div className="text-[11px] uppercase text-muted-foreground leading-tight">{label}</div>
    <div className="text-base font-semibold mt-1">{fmtTTD(amount)}</div>
  </div>
);

const Line: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{fmtTTD(amount)}</span>
  </div>
);

const SliderRow: React.FC<{
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, current, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{label}</span>
      <span className="text-primary font-semibold">{value}</span>
    </div>
    <Slider
      value={[current]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
    />
  </div>
);
