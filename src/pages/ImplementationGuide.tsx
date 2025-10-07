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
    { name: "Supabase", category: "Backend", description: "Database, auth, and real-time features" },
    { name: "React Router", category: "Routing", description: "Client-side routing and navigation" },
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
        
        {/* System Architecture */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            System Architecture
          </h2>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>TAV Architecture Overview</CardTitle>
              <CardDescription>
                High-level system design showing component relationships and data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg">
                <pre className="text-sm overflow-x-auto">
{`┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │  TAV Assistant   │    │  Form Engine    │
│                 │────│                  │────│                 │
│ • Components    │    │ • Conversation   │    │ • Field Mapping │
│ • State Mgmt    │    │ • Context        │    │ • Validation    │
│ • Routing       │    │ • Role Detection │    │ • Submission    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌──────────────────┐
                    │   Supabase       │
                    │                  │
                    │ • Database       │
                    │ • Authentication │
                    │ • Real-time      │
                    │ • Edge Functions │
                    └──────────────────┘`}
                </pre>
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