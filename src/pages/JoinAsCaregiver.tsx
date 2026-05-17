import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Clock, Users, Star, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { getStoredUTMData } from '@/utils/utmTracking';
import { SEO } from '@/components/seo/SEO';

const JoinAsCaregiver = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Capture UTM params on load
  useEffect(() => {
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmContent = searchParams.get('utm_content');

    if (utmSource || utmCampaign) {
      const utmData = {
        utm_source: utmSource || '',
        utm_medium: utmMedium || '',
        utm_campaign: utmCampaign || '',
        utm_content: utmContent || '',
        landing_page: '/join-as-caregiver',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('tavara_utm_data', JSON.stringify(utmData));
      console.log('[JoinAsCaregiver] UTM data captured:', utmData);
    }
  }, [searchParams]);

  const handleSignUp = () => {
    navigate('/auth?tab=signup&role=professional&from=join-as-caregiver');
  };

  const benefits = [
    {
      icon: Heart,
      title: 'Make a Real Difference',
      description: 'Connect with families who genuinely need your expertise and compassion.'
    },
    {
      icon: Shield,
      title: 'Vetted & Trusted Platform',
      description: 'Join a community that values professionalism, safety, and trust.'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Choose shifts that work for your life — weekdays, evenings, weekends, or live-in.'
    },
    {
      icon: Users,
      title: 'Matched to the Right Families',
      description: 'Our matching system pairs you with families based on your skills, location, and preferences.'
    },
    {
      icon: Star,
      title: 'Grow Your Career',
      description: 'Access training resources, build your professional profile, and earn testimonials.'
    }
  ];

  const steps = [
    'Create your free account',
    'Complete your professional profile',
    'Upload your credentials & documents',
    'Get matched with families who need you'
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Become a Caregiver in Trinidad & Tobago | Join Tavara"
        description="Join Tavara as a professional caregiver. Get matched with families who need your skills, build your profile, and grow your career in home care."
        canonicalPath="/join-as-caregiver"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium mb-2">
                <MapPin className="h-4 w-4" />
                High Demand: San Fernando / Palmiste Area
              </div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4" />
                Trinidad & Tobago's Care Community
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
            >
              Your Caregiving Skills Are <span className="text-primary">Needed</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Families across Trinidad & Tobago are looking for compassionate, skilled caregivers like you. 
              Join Tavara and start making a difference today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="text-lg px-8 py-6 font-semibold shadow-lg"
              >
                Join Tavara Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/urgent-families")}
                className="text-lg px-8 py-6 font-semibold"
              >
                See Families Who Need You
              </Button>
            </motion.div>
            <p className="text-sm text-muted-foreground">Free to join • No hidden fees • Start in minutes</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Caregivers Choose Tavara
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building a platform that puts caregivers first — connecting you with families who value your expertise.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Started in 4 Simple Steps
            </h2>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-5 bg-background rounded-xl border border-border">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-lg font-medium text-foreground">{step}</p>
                <CheckCircle2 className="h-5 w-5 text-muted-foreground/30 ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button 
              size="lg" 
              onClick={handleSignUp}
              className="text-lg px-8 py-6 font-semibold"
            >
              Sign Up Now — It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Join Our Care Community?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Families are waiting. Your skills, compassion, and experience can change lives. 
            Sign up today and let us connect you with families who need you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSignUp}
              className="text-lg px-8 py-6 font-semibold"
            >
              Join Tavara Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/urgent-families")}
              className="text-lg px-8 py-6 font-semibold"
            >
              View Families Needing Care
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinAsCaregiver;
