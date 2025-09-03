import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TAVWidget } from '@/tav-core/components/TAVWidget';
import { FormDetector } from '@/tav-core/components/FormDetector';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Zap, Shield, Palette, Code, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { DemoConfiguration, CoreConversationContext, BrandingConfig } from '@/tav-core/types/core';

export default function TavDemo() {
  const [demoConfig, setDemoConfig] = useState<DemoConfiguration>({
    type: 'interactive',
    useCase: 'registration',
    industry: 'healthcare',
    companySize: 'small'
  });

  const [branding, setBranding] = useState<BrandingConfig>({
    assistantName: 'TAV',
    primaryColor: '#3b82f6',
    secondaryColor: '#e5e7eb',
    companyName: 'Demo Company',
    welcomeMessage: 'Hi! I\'m TAV, your intelligent form assistant. I can help guide you through any process step by step!'
  });

  const [showWidget, setShowWidget] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'form' | 'custom' | null>(null);

  // Demo form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    useCase: '',
    industry: '',
    teamSize: '',
    timeline: '',
    budget: '',
    requirements: ''
  });

  const conversationContext: CoreConversationContext = {
    currentPage: '/tav-demo',
    currentForm: activeDemo === 'form' ? 'demo_registration_form' : undefined,
    formFields: activeDemo === 'form' ? {
      fullName: 'Full Name',
      email: 'Email Address',
      company: 'Company Name',
      role: 'Your Role',
      useCase: 'Primary Use Case',
      industry: 'Industry',
      teamSize: 'Team Size',
      timeline: 'Implementation Timeline',
      budget: 'Budget Range',
      requirements: 'Special Requirements'
    } : undefined,
    userRole: 'guest',
    sessionId: 'demo_session',
    demoConfig,
    branding
  };

  const handleStartDemo = (type: 'form' | 'custom') => {
    setActiveDemo(type);
    setShowWidget(true);
  };

  const handleCustomizationChange = (field: keyof BrandingConfig, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  return (
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
                onClick={() => handleStartDemo('form')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Interactive Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setActiveDemo('custom')}
                className="border-blue-200 text-blue-600"
              >
                <Palette className="h-4 w-4 mr-2" />
                Customize & Preview
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

      {/* Customization Section */}
      {activeDemo === 'custom' && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">Customize Your Assistant</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assistantName">Assistant Name</Label>
                    <Input
                      id="assistantName"
                      value={branding.assistantName}
                      onChange={(e) => handleCustomizationChange('assistantName', e.target.value)}
                      placeholder="TAV"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={branding.companyName}
                      onChange={(e) => handleCustomizationChange('companyName', e.target.value)}
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={branding.welcomeMessage}
                      onChange={(e) => handleCustomizationChange('welcomeMessage', e.target.value)}
                      placeholder="Hi! I'm your assistant..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={() => setShowWidget(true)}
                    className="w-full"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    Preview Your Assistant
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Live Preview</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded border">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.assistantName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{branding.assistantName}</p>
                      <p className="text-xs text-gray-500">AI Assistant for {branding.companyName}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border">
                    <p className="text-sm">{branding.welcomeMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Demo Form Section */}
      {activeDemo === 'form' && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Interactive Form Demo</h3>
              <p className="text-gray-600">
                Try filling out this form with TAV's assistance. Click the chat widget to get started!
              </p>
              <FormDetector />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Business Registration Form</CardTitle>
                <CardDescription>
                  Complete this form to learn more about TAV for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" data-form-title="Business Registration Form">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your company"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Your Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger id="role" name="role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ceo">CEO/Founder</SelectItem>
                          <SelectItem value="cto">CTO/Tech Lead</SelectItem>
                          <SelectItem value="product">Product Manager</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="useCase">Primary Use Case *</Label>
                    <Select value={formData.useCase} onValueChange={(value) => setFormData(prev => ({ ...prev, useCase: value }))}>
                      <SelectTrigger id="useCase" name="useCase">
                        <SelectValue placeholder="What will you use TAV for?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registration">User Registration Forms</SelectItem>
                        <SelectItem value="interview">Interview/Survey Forms</SelectItem>
                        <SelectItem value="feedback">Feedback Collection</SelectItem>
                        <SelectItem value="support">Customer Support</SelectItem>
                        <SelectItem value="onboarding">User Onboarding</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="e.g., Healthcare, SaaS, E-commerce"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Select value={formData.teamSize} onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: value }))}>
                        <SelectTrigger id="teamSize" name="teamSize">
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 people</SelectItem>
                          <SelectItem value="6-20">6-20 people</SelectItem>
                          <SelectItem value="21-50">21-50 people</SelectItem>
                          <SelectItem value="51-200">51-200 people</SelectItem>
                          <SelectItem value="200+">200+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Special Requirements</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="Any specific features or integrations you need?"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Complete Registration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* TAV Widget */}
      {showWidget && (
        <TAVWidget
          context={conversationContext}
          branding={branding}
          position="bottom-right"
          autoOpen={true}
        />
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
    </div>
  );
}