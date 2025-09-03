import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Database, 
  Layers, 
  Users, 
  Zap, 
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Copy,
  Download,
  GitBranch,
  Server,
  Smartphone,
  Globe
} from 'lucide-react';

export default function ImplementationGuide() {
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const starterPrompt = `Create a conversational AI assistant for form completion that:

1. Analyzes form fields and guides users through multi-step completion
2. Uses contextual conversation to gather information naturally
3. Integrates with React forms using state management
4. Provides real-time validation and helpful suggestions
5. Supports multiple user roles with different conversation flows

Technical Requirements:
- React 18+ with TypeScript
- State management for conversation context
- Form integration with controlled components
- Responsive design with Tailwind CSS
- Backend integration for data persistence

Key Features:
- Natural language processing for user inputs
- Progressive form completion based on conversation
- Role-based conversation flows (family, professional, community)
- Smart field mapping from conversation to form data
- Session persistence and resume capability

Implementation should follow TAV (Tavara AI Assistant) patterns for conversational UX and maintain accessibility standards.`;

  const difficultyLevels = [
    {
      level: "Basic Implementation",
      duration: "1-2 weeks",
      cost: "$5,000 - $10,000",
      team: "1-2 developers",
      features: [
        "Simple conversational interface",
        "Basic form integration",
        "Single user role support",
        "Local state management"
      ],
      complexity: "Low"
    },
    {
      level: "Advanced Features",
      duration: "4-6 weeks", 
      cost: "$15,000 - $25,000",
      team: "2-3 developers",
      features: [
        "Multi-role conversation flows",
        "Backend integration",
        "Session persistence",
        "Advanced form validation",
        "Analytics tracking"
      ],
      complexity: "Medium"
    },
    {
      level: "Enterprise Solution",
      duration: "8-12 weeks",
      cost: "$30,000 - $50,000+",
      team: "3-5 developers",
      features: [
        "Custom AI model integration",
        "Advanced analytics dashboard",
        "Multi-tenant architecture",
        "Custom branding & themes",
        "Advanced security features",
        "API integrations"
      ],
      complexity: "High"
    }
  ];

  const techStack = [
    { name: "React 18+", category: "Frontend", description: "Component-based UI with hooks" },
    { name: "TypeScript", category: "Language", description: "Type safety and developer experience" },
    { name: "Tailwind CSS", category: "Styling", description: "Utility-first CSS framework" },
    { name: "GPT-4 AI Model", category: "AI Engine", description: "Natural language processing and conversation" },
    { name: "Supabase Edge Functions", category: "AI Backend", description: "Serverless AI processing and database integration" },
    { name: "Supabase", category: "Backend", description: "Database, auth, and real-time features" },
    { name: "React Router", category: "Routing", description: "Client-side routing and navigation" },
    { name: "Context API", category: "State Mgmt", description: "Conversation state and AI context management" },
    { name: "Framer Motion", category: "Animation", description: "Smooth animations and transitions" },
    { name: "Radix UI", category: "Components", description: "Accessible UI primitives" },
    { name: "Vite", category: "Build Tool", description: "Fast development and building" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-6xl py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/tav-demo')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to TAV Demo
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Technical Implementation Guide</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Build your own conversational AI assistant like TAV. Complete technical architecture, 
                implementation patterns, and ready-to-use resources for CTOs and technical teams.
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              CTO Insights
            </Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-12 space-y-16">
        
        {/* What is TAV? - Layman's Introduction */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            What is TAV?
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your AI-Powered Form Assistant</CardTitle>
              <CardDescription>
                TAV (Tavara AI Assistant) is like having a knowledgeable friend sitting next to you while filling out paperwork
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    🤖 Powered by Advanced AI
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    TAV uses artificial intelligence to understand what you're trying to accomplish and guides you through 
                    complex forms using natural conversation - just like talking to a helpful person.
                  </p>
                  <h4 className="font-semibold mb-2">Key Benefits:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      No more confusing forms or abandoned applications
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Understands context and remembers your previous answers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Adapts to different users (families, professionals, community members)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Available 24/7 without human support costs
                    </li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Real-World Analogy</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Imagine walking into a government office or insurance company, but instead of standing in line with 
                    confusing paperwork, there's a friendly, knowledgeable person who:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Asks you simple questions in plain English</li>
                    <li>• Remembers everything you tell them</li>
                    <li>• Fills out the complex forms for you</li>
                    <li>• Never gets tired or impatient</li>
                    <li>• Is available whenever you need help</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">
                    That's exactly what TAV does, but powered by AI technology.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How TAV Works - Simple Version */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            How TAV Works (Simple Version)
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>The User Experience</CardTitle>
              <CardDescription>
                See how AI transforms form completion from frustrating to effortless
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">1. User Visits Form</h4>
                  <p className="text-sm text-muted-foreground">
                    TAV appears as a friendly chat assistant, ready to help with the form
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">2. Natural Conversation</h4>
                  <p className="text-sm text-muted-foreground">
                    AI asks questions in plain English and understands the responses contextually
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">3. Smart Form Filling</h4>
                  <p className="text-sm text-muted-foreground">
                    AI maps conversation answers to the correct form fields automatically
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">4. Confident Submission</h4>
                  <p className="text-sm text-muted-foreground">
                    User submits complete, accurate form with confidence and satisfaction
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  🧠 AI Technology Made Simple
                </h4>
                <p className="text-muted-foreground">
                  TAV uses advanced natural language processing (NLP) and machine learning to understand context, 
                  remember conversations, and adapt to different user needs. It's like having a computer that can 
                  think and communicate like a human, but specifically trained to help with forms and applications.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why This Matters - Business Value */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Why This Matters
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>The Problem with Traditional Forms</CardTitle>
              <CardDescription>
                Understanding the business case for AI-powered form assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-destructive">❌ Traditional Forms Are Broken</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">High Abandonment:</span> 70% of users abandon complex forms
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Confusion & Errors:</span> Users struggle with unclear fields and validation
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Support Burden:</span> Endless help desk tickets for form questions
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Lost Revenue:</span> Every abandoned form is a lost customer or opportunity
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-primary">✅ TAV AI Solution</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">65% Higher Completion:</span> Conversational interface reduces cognitive load
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Instant Guidance:</span> AI provides real-time help and validation
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">40% Fewer Support Tickets:</span> Users get help without human intervention
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Better Data Quality:</span> AI ensures complete, accurate submissions
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-6 border border-primary/20 bg-primary/5 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  💡 Business Impact
                </h4>
                <p className="text-muted-foreground">
                  Organizations implementing conversational AI assistants like TAV see immediate improvements in user satisfaction, 
                  operational efficiency, and revenue. The technology pays for itself within 3-6 months through reduced support costs 
                  and increased conversion rates.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bridge to Technical Section */}
        <section>
          <div className="text-center py-8">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready to Dive Deeper?</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Now that you understand what TAV is and why it matters, let's explore how it works under the hood. 
                The following sections are designed for technical teams and CTOs who want to understand the architecture, 
                technology choices, and implementation details.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  React & TypeScript Architecture
                </span>
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  AI Integration Patterns
                </span>
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Modern Development Stack
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* System Architecture */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            System Architecture
          </h2>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>TAV AI-Powered Architecture</CardTitle>
              <CardDescription>
                High-level system design showing AI integration, component relationships, and data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg mb-6">
                <pre className="text-sm overflow-x-auto">
{`┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │  TAV AI Engine   │    │  Form Engine    │
│                 │────│                  │────│                 │
│ • Components    │    │ • GPT-4 AI       │    │ • Field Mapping │
│ • State Mgmt    │    │ • NLP Processing │    │ • Validation    │
│ • Chat Interface│    │ • Context Memory │    │ • Auto-Fill     │
│ • Real-time UI  │    │ • Role Detection │    │ • Submission    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌──────────────────┐
                    │   Supabase       │
                    │                  │
                    │ • Database       │
                    │ • Authentication │
                    │ • Edge Functions │
                    │ • AI Processing  │
                    │ • Real-time Sync │
                    └──────────────────┘`}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    🤖 AI Processing Layer
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• GPT-4 natural language understanding</li>
                    <li>• Context-aware conversation management</li>
                    <li>• Intent recognition and response generation</li>
                    <li>• Dynamic form field mapping</li>
                  </ul>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    ⚛️ Frontend Layer
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• React components with TypeScript</li>
                    <li>• Real-time chat interface</li>
                    <li>• State management for conversations</li>
                    <li>• Responsive form integration</li>
                  </ul>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    🗄️ Backend Layer
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Supabase Edge Functions for AI calls</li>
                    <li>• PostgreSQL for data persistence</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Authentication and security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Technology Stack */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Code2 className="h-8 w-8 text-primary" />
            Technology Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{tech.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">{tech.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Implementation Roadmap */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-primary" />
            Implementation Roadmap
          </h2>
          
          <div className="space-y-6">
            {difficultyLevels.map((level, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {level.level}
                        <Badge variant={level.complexity === 'Low' ? 'secondary' : level.complexity === 'Medium' ? 'default' : 'destructive'}>
                          {level.complexity}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-6 mt-2">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {level.duration}
                        </span>
                        <span className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {level.cost}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {level.team}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Features</h4>
                      <ul className="space-y-1">
                        {level.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Copy-Paste Resources */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Copy className="h-8 w-8 text-primary" />
            Ready-to-Use Resources
          </h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Starter Prompt for Implementation</CardTitle>
              <CardDescription>
                Copy this prompt to get started with your own conversational AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap mb-4">
                  {starterPrompt}
                </pre>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(starterPrompt)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Prompt
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Essential tables and relationships for conversation tracking and user management.
                </p>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Schema
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Component Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  React components for conversation interface, form integration, and state management.
                </p>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Get Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTO Insights */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            CTO Insights & Lessons Learned
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Why Conversational Forms?</h4>
                  <p className="text-sm text-muted-foreground">
                    Traditional forms create cognitive load. Conversational interfaces reduce abandonment 
                    by 40% and increase completion rates by guiding users naturally through complex workflows.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">State Management Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    Context-based state rather than global state. Each conversation maintains its own 
                    context while sharing form data through controlled components.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Common Pitfalls</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Over-engineering the conversation logic</li>
                    <li>• Tight coupling between UI and conversation state</li>
                    <li>• Insufficient error handling for edge cases</li>
                    <li>• Poor mobile experience optimization</li>
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Success Metrics</h4>
                  <p className="text-sm text-muted-foreground">
                    Track completion rates, time-to-completion, and user satisfaction. 
                    TAV improved our form completion by 65% and user satisfaction by 80%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ROI & Business Impact */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            ROI & Business Impact
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Expected Returns</CardTitle>
              <CardDescription>
                Based on implementation across multiple client projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">65%</div>
                  <p className="text-sm text-muted-foreground">Increase in Form Completion</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">40%</div>
                  <p className="text-sm text-muted-foreground">Reduction in Support Tickets</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">3-6mo</div>
                  <p className="text-sm text-muted-foreground">Typical ROI Timeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Get Started CTA */}
        <section className="text-center py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Build Your Own?</CardTitle>
              <CardDescription>
                Start with our technical resources or explore TAV in action
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/tav-demo')}>
                <Zap className="h-5 w-5 mr-2" />
                Try TAV Demo
              </Button>
              <Button variant="outline" size="lg">
                <Globe className="h-5 w-5 mr-2" />
                Schedule Technical Call
              </Button>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}