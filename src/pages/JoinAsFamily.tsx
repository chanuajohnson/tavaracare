import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, CalendarCheck, Users, ClipboardList, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

const SIGNUP_PATH = '/auth?tab=signup&role=family&from=join-as-family';

/** Family welcome page behind tavara.care/register. Tells families they are in the right place, then sends them to sign-up. */
const JoinAsFamily = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    if (utmSource || utmCampaign) {
      localStorage.setItem('tavara_utm_data', JSON.stringify({
        utm_source: utmSource || '',
        utm_medium: searchParams.get('utm_medium') || '',
        utm_campaign: utmCampaign || '',
        utm_content: searchParams.get('utm_content') || '',
        landing_page: '/join-as-family',
        timestamp: new Date().toISOString(),
      }));
    }
  }, [searchParams]);

  const handleSignUp = () => navigate(SIGNUP_PATH);

  const promises = [
    { icon: Heart, title: 'Care that fits your loved one', description: 'Tell us what your mum, dad or family member needs, in your own words. We match care to the person, not the other way around.' },
    { icon: Shield, title: 'Caregivers you can trust', description: 'Every caregiver is screened, with credentials and references checked before they meet your family.' },
    { icon: CalendarCheck, title: 'A schedule that holds', description: 'Weekdays, weekends, evenings or live-in. We plan cover for days off and sick days, so care keeps going.' },
    { icon: Users, title: 'A care team, not one person', description: 'Your loved one gets a main caregiver plus trusted fill-ins who already know the routine.' },
    { icon: ClipboardList, title: 'See every shift', description: 'Daily care logs, medication records and updates all in one place, wherever you are.' },
    { icon: MessageCircle, title: 'A real person to talk to', description: 'Questions, changes or a hard day: message the Tavara team on WhatsApp and we will help.' },
  ];

  const steps = [
    'Create your free family account',
    'Tell us about your loved one and the care they need',
    'Take the short care readiness check',
    'Meet caregivers matched to your home, area and schedule',
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Arrange Home Care in Trinidad & Tobago | Register Your Family | Tavara"
        description="You do not have to do this alone. Register your family with Tavara to arrange trusted, screened home care for your loved one across Trinidad and Tobago."
        canonicalPath="/join-as-family"
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4" />
                For families across Trinidad & Tobago
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
            >
              You don't have to do this <span className="text-primary">alone</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Caring for someone you love is a lot to carry. Tavara helps you arrange trusted care at home,
              build a steady care team, and keep everyone on the same page. You are in the right place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button size="lg" onClick={handleSignUp} className="text-lg px-8 py-6 font-semibold shadow-lg">
                Register my family
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/urgent-caregivers')} className="text-lg px-8 py-6 font-semibold">
                See caregivers ready to start
              </Button>
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Free to register. Already have an account?{' '}
              <button type="button" onClick={() => navigate('/auth')} className="underline text-primary font-medium">Log in</button>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">We're here to carry some of the weight</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tavara is a care coordination platform. We help your household arrange care and keep it steady, week after week.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promises.map((p) => (
              <Card key={p.title} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <p.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{p.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{p.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Four steps. You can pause and come back any time.</p>
          </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-4 p-5 bg-background rounded-xl border border-border">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">{i + 1}</div>
                <p className="text-lg font-medium text-foreground">{step}</p>
                <CheckCircle2 className="h-5 w-5 text-muted-foreground/30 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={handleSignUp} className="text-lg px-8 py-6 font-semibold">
              Register my family, it's free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Let's find the right care, together</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Care rates start at $40 an hour. We talk through your situation first, so the plan fits your loved one and your household.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleSignUp} className="text-lg px-8 py-6 font-semibold">
              Register my family
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8 py-6 font-semibold">
              I already have an account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Tavara is a Care Coordination & Management Platform. Families engage caregivers directly. Tavara is not an employment or placement agency.
          </p>
        </div>
      </section>
    </div>
  );
};

export default JoinAsFamily;
