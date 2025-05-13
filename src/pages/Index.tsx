
import { useState, useRef } from "react";
import { Users, UserCog, Heart, ArrowRight, Check, Vote, HelpCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fab } from "@/components/ui/fab";
import { MicroChatBubble } from "@/components/chatbot/MicroChatBubble";
import { ChatbotSystem } from "@/components/chatbot/ChatbotSystem";
import { EnvironmentInfo } from "@/components/debug/EnvironmentInfo";
import { SupabaseDebugger } from "@/components/debug/SupabaseDebugger";
import { FadeIn, SlideIn, ScaleIn } from "@/components/framer";

const roles = [
  {
    id: "family",
    title: "Family",
    description: "Coordinate care for your loved ones",
    icon: Users,
    color: "bg-primary-100",
    path: "/dashboard/family",
    cta: "Find Care Now",
    features: ["Create and manage care plans", "Find qualified caregivers", "Track medications and appointments", "Coordinate with care team", "Monitor care activities", "Access care logs and reports"]
  },
  {
    id: "professional",
    title: "Professional",
    description: "Provide care services and expertise",
    icon: UserCog,
    color: "bg-primary-200",
    path: "/dashboard/professional",
    cta: "Get Hired as a Skilled Care Professional",
    features: ["Showcase qualifications", "Find care opportunities", "Manage client relationships", "Track care delivery", "Access training resources", "Professional development"]
  }
];

const communityRole = {
  id: "community",
  title: "Community",
  description: "Support and contribute to care networks",
  icon: Heart,
  color: "bg-primary-300",
  path: "/dashboard/community",
  cta: "Join the Village",
  features: ["Join care circles", "Share local resources", "Participate in community events", "Offer support services", "Connect with families", "Track community impact"]
};

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleRoleSelect = (roleId: string) => {
    if (roleId === "community") {
      const role = communityRole;
      setSelectedRole(roleId);
      navigate(role.path);
      toast.success(`Welcome to the ${role.title} Dashboard! Sign in to access all features.`);
    } else {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        setSelectedRole(roleId);
        navigate(role.path);
        toast.success(`Welcome to the ${role.title} Dashboard! Sign in to access all features.`);
      }
    }
  };

  const handleGetStarted = () => {
    comparisonRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-primary-100">
      <div className="container px-4 py-12 mx-auto">
        <FadeIn
          duration={0.5}
          className="text-center mb-16"
        >
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4 inline-block">
            Care Coordination Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Tavara</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community of care coordinators, families, and professionals to make
            caring easier and more effective.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => (
            <FadeIn
              key={role.id}
              delay={index * 0.1}
              duration={0.5}
              className={`relative group`}
            >
              <div className={`${role.color} rounded-2xl p-6 h-full transition-transform duration-300 group-hover:scale-[1.02]`}>
                <div className="mb-4">
                  <role.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{role.title}</h3>
                <p className="text-gray-600 mb-6">{role.description}</p>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleRoleSelect(role.id)}
                    className="inline-flex items-center text-primary-700 font-medium group/button"
                  >
                    {role.cta}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                  </button>
                  
                  <MicroChatBubble role={role.id as 'family' | 'professional' | 'community'} />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn
          delay={0.6}
          duration={0.5}
          className="text-center mt-16"
        >
          <div className="relative inline-flex items-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center h-11 px-8 font-medium text-white bg-primary-500 rounded-full transition-colors duration-300 hover:bg-primary-600"
            >
              Get Started
            </button>
            
            <div className="ml-3">
              <MicroChatBubble role="family" position="right" />
            </div>
          </div>
        </FadeIn>

        <div ref={comparisonRef} className="mt-32">
          <FadeIn
            duration={0.5}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who is Tavara For?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your perfect match, whether you're seeking care or providing care
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {roles.map((role, index) => (
              <SlideIn
                key={role.id}
                direction={index % 2 === 0 ? 'left' : 'right'}
                delay={index * 0.1}
                duration={0.5}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="mb-4">
                      <role.icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <CardTitle>{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {role.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <ArrowRight className="w-4 h-4 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex justify-between items-center mt-6">
                      <Link to={role.path}>
                        <Button className="inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                          {role.cta}
                        </Button>
                      </Link>
                      
                      <MicroChatBubble role={role.id as 'family' | 'professional' | 'community'} position="right" />
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            ))}
          </div>
        </div>

        <div className="mt-32 max-w-5xl mx-auto">
          <SlideIn
            direction="up"
            duration={0.5}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Community Engagement</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how you can support and contribute to care networks in your community.
            </p>
          </SlideIn>

          <div className="max-w-3xl mx-auto">
            <ScaleIn
              duration={0.5}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-4">
                    <communityRole.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <CardTitle>{communityRole.title}</CardTitle>
                  <CardDescription>{communityRole.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {communityRole.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <ArrowRight className="w-4 h-4 text-primary-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between items-center mt-6">
                    <Link to={communityRole.path}>
                      <Button className="inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-primary-500 rounded-lg transition-colors duration-300 hover:bg-primary-600">
                        {communityRole.cta}
                      </Button>
                    </Link>
                    
                    <MicroChatBubble role="community" position="right" />
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>
          </div>
        </div>

        <div className="mt-32 max-w-5xl mx-auto">
          <FadeIn
            duration={0.5}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shape Our Future Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              See our feature roadmap to up-vote the capabilities you'd like to see next and influence our product development priorities.
            </p>
            <Link to="/features">
              <Card className="p-6 text-left bg-white cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="w-5 h-5 text-primary-600" />
                    Feature Voting System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Our feature voting system lets you:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      Vote for features you want to see implemented
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      Track feature development progress
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      Get notified when features are launched
                    </li>
                  </ul>
                  <div className="mt-6 flex justify-end">
                    <span className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
                      View Feature Roadmap
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </FadeIn>
        </div>
      </div>
      
      <ChatbotSystem
        position="left-of-fab" 
        spacing={24}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
      
      <Fab
        position="bottom-right"
        icon={<HelpCircle className="h-5 w-5" />}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
      
      {isDebug && (
        <div className="mt-12 space-y-6 border-t pt-8">
          <h2 className="text-2xl font-semibold">Debug Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <EnvironmentInfo />
            <SupabaseDebugger />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            These tools are only visible when ?debug=true is added to the URL
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
