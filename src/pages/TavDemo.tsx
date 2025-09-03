import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Zap, Shield, Palette, Code, ArrowRight, Play, Users, Heart, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { TavaraAssistantPanel, TavaraStateProvider } from '@/components/tav';

export default function TavDemo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeDemo, setActiveDemo] = useState<'family' | 'professional' | 'community' | 'care-needs' | 'legacy' | null>(null);
  const demoSectionRef = useRef<HTMLElement>(null);

  // Auto-open demo section if openDemo parameter is present
  useEffect(() => {
    if (searchParams.get('openDemo') === 'true') {
      setActiveDemo('family');
      setTimeout(() => {
        if (demoSectionRef.current) {
          demoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchParams]);

  const demoOptions = [
    {
      id: 'family' as const,
      title: 'Family Registration',
      description: 'Experience how families find and connect with perfect caregivers',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      path: '/registration/family?demo=true&role=guest',
      enabled: true
    },
    {
      id: 'professional' as const,
      title: 'Professional Registration', 
      description: 'Coming Soon',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      path: '',
      enabled: false
    },
    {
      id: 'community' as const,
      title: 'Community Registration',
      description: 'Coming Soon',
      icon: Building,
      color: 'from-green-500 to-emerald-500', 
      path: '',
      enabled: false
    },
    {
      id: 'care-needs' as const,
      title: 'Care Needs Assessment',
      description: 'Walk through our intelligent care planning process',
      icon: Heart,
      color: 'from-purple-500 to-violet-500',
      path: '/family/care-assessment?demo=true&role=guest',
      enabled: true
    },
    {
      id: 'legacy' as const,
      title: 'Legacy Stories',
      description: 'Experience our family story capture and sharing platform',
      icon: MessageCircle,
      color: 'from-amber-500 to-orange-500',
      path: '/family/story?demo=true&role=guest',
      enabled: true
    }
  ];

  const handleStartDemo = (path: string, enabled: boolean) => {
    if (!enabled) {
      return; // Do nothing for disabled demos
    }
    
    // Track demo analytics
    console.log('TAV Demo: Starting demo with path:', path);
    
    // Navigate to the real form with demo parameters
    navigate(path);
  };

  return (
    <TavaraStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Form Assistant
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meet TAV
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The intelligent conversational assistant that transforms how users interact with forms. 
              Reduce abandonment, increase completion rates, and create delightful user experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => {
                  setActiveDemo('family');
                  // Scroll to demo section after it renders
                  setTimeout(() => {
                    demoSectionRef.current?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }, 100);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Interactive Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/implementation-guide')}
                className="border-blue-200 text-blue-600"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                View Implementation Guide
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Businesses Choose TAV</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how TAV can transform your user experience and increase conversion rates
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'Conversational Experience',
                description: 'Transform static forms into engaging conversations that guide users naturally through complex processes.'
              },
              {
                icon: Zap,
                title: 'Reduce Abandonment',
                description: 'Cut form abandonment rates by up to 40% with intelligent assistance and real-time help.'
              },
              {
                icon: Shield,
                title: 'Smart Validation',
                description: 'Prevent errors before they happen with contextual validation and helpful suggestions.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Selection Grid */}
      {activeDemo && (
        <section ref={demoSectionRef} className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Choose Your Demo Experience</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience TAV's magic across different user journeys. Each demo uses our real forms with actual TAV assistance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoOptions.map((option) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: demoOptions.indexOf(option) * 0.1 }}
                >
                  <Card className={`h-full transition-shadow ${option.enabled 
                    ? 'hover:shadow-lg cursor-pointer group' 
                    : 'opacity-60 cursor-not-allowed'
                  }`}
                        onClick={() => handleStartDemo(option.path, option.enabled)}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-3 ${!option.enabled ? 'opacity-50' : ''}`}>
                        <option.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-lg transition-colors ${option.enabled ? 'group-hover:text-primary' : 'text-gray-500'}`}>
                          {option.title}
                        </CardTitle>
                        {!option.enabled && (
                          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={`mb-4 ${option.enabled ? 'text-gray-600' : 'text-gray-400'}`}>{option.description}</p>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled={!option.enabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDemo(option.path, option.enabled);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {option.enabled ? 'Start Demo' : 'Coming Soon'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 mb-4">
                💡 TAV will automatically assist you through each form with intelligent guidance
              </p>
              <Button 
                variant="ghost" 
                onClick={() => setActiveDemo(null)}
                className="text-gray-600"
              >
                ← Back to Overview
              </Button>
            </div>
          </div>
        </section>
      )}



      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Forms?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of companies using TAV to create better user experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Code className="h-4 w-4 mr-2" />
              View Implementation Guide
            </Button>
          </div>
        </div>
      </section>
      
      {/* TAV Assistant Panel - The Real TAV Magic */}
      <TavaraAssistantPanel />
    </div>
    </TavaraStateProvider>
  );
}