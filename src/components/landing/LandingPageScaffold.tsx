import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, MapPin, Heart, Phone } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';
import { HowMatchingWorksCard } from '@/components/about/HowMatchingWorksCard';

export interface LandingFAQ {
  q: string;
  a: string;
}

export interface LandingSection {
  heading: string;
  body: string;
}

export interface LandingPageData {
  slug: string; // url path after the base, e.g. "care/port-of-spain"
  pageTitle: string; // <title>
  metaDescription: string;
  h1: string;
  kicker: string; // short label above H1
  intro: string; // opening paragraph
  sections: LandingSection[];
  faqs: LandingFAQ[];
  schemaType: 'LocalBusiness' | 'Service';
  areaServed?: string; // for LocalBusiness
  serviceType?: string; // for Service
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

const BASE_URL = 'https://tavara.care';

export const LandingPageScaffold: React.FC<{ data: LandingPageData }> = ({ data }) => {
  const canonical = `/${data.slug}`;
  const url = `${BASE_URL}${canonical}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const primarySchema =
    data.schemaType === 'LocalBusiness'
      ? {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: `Tavara Care — ${data.areaServed}`,
          description: data.metaDescription,
          url,
          telephone: '+1-868-786-5357',
          areaServed: data.areaServed,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'TT',
            addressRegion: data.areaServed,
          },
          priceRange: '$40-$50+ per hour',
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: data.serviceType,
          description: data.metaDescription,
          url,
          provider: { '@type': 'Organization', name: 'Tavara Care', url: BASE_URL },
          areaServed: 'Trinidad and Tobago',
        };

  const primaryCtaHref = data.primaryCtaHref ?? '/registration/family';
  const primaryCtaLabel = data.primaryCtaLabel ?? 'Start arranging care';
  const secondaryCtaHref = data.secondaryCtaHref ?? '/urgent-caregivers';
  const secondaryCtaLabel = data.secondaryCtaLabel ?? 'Browse available caregivers';

  return (
    <>
      <SEO
        title={data.pageTitle}
        description={data.metaDescription}
        canonicalPath={canonical}
        schema={[primarySchema, faqSchema]}
      />
      <Helmet>
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="container max-w-4xl mx-auto px-4 py-16 md:py-20">
            <p className="text-sm font-medium text-primary uppercase tracking-wide flex items-center gap-2">
              {data.schemaType === 'LocalBusiness' ? <MapPin className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
              {data.kicker}
            </p>
            <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">{data.h1}</h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{data.intro}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link to={primaryCtaHref}>{primaryCtaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Care rates strip */}
        <section className="border-b bg-muted/30">
          <div className="container max-w-4xl mx-auto px-4 py-10">
            <h2 className="text-xl font-semibold mb-4">Care rates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Standard', rate: '$40 / hour', detail: 'Companion and daily living support' },
                { name: 'Full Service', rate: '$45 / hour', detail: 'Personal care, mobility, light clinical tasks' },
                { name: 'Premium', rate: '$50+ / hour', detail: 'Complex needs, specialised clinical scope' },
              ].map((tier) => (
                <Card key={tier.name}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{tier.name}</p>
                    <p className="text-2xl font-bold mt-1">{tier.rate}</p>
                    <p className="text-sm mt-2 text-muted-foreground">{tier.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Care rates are paid directly to the caregiver. Subscription tier details are shared privately during onboarding.
            </p>
          </div>
        </section>

        {/* Sections */}
        <section className="container max-w-3xl mx-auto px-4 py-14 space-y-10">
          {data.sections.map((s, i) => (
            <article key={i}>
              <h2 className="text-2xl font-semibold mb-3">{s.heading}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
            </article>
          ))}
        </section>

        {/* How matching works — shared with /about for one source of truth */}
        <section className="bg-muted/30 border-y">
          <div className="container max-w-4xl mx-auto px-4 py-12">
            <HowMatchingWorksCard />
          </div>
        </section>

        {/* FAQs */}
        <section className="container max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {data.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Closing CTA */}
        <section className="bg-primary/5 border-t">
          <div className="container max-w-3xl mx-auto px-4 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold">Ready to arrange care?</h2>
            <p className="mt-3 text-muted-foreground">
              Tell us about your loved one and we will match you with caregivers who fit.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to={primaryCtaHref}>{primaryCtaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://wa.me/18687865357">
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp us
                </a>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Vetted caregivers</li>
              <li className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Transparent rates</li>
              <li className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Dashboard coordination</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingPageScaffold;
