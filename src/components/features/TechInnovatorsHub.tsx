
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UpvoteFeatureButton } from '@/components/features/UpvoteFeatureButton';
import { ShieldCheck, Code, Brain, Users } from 'lucide-react';

export const TechInnovatorsHub = () => {
  return (
    <Card className="lg:col-span-3 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          🚀 Insider Access & Tech Innovators Hub
        </CardTitle>
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 bg-blue-100 text-blue-800">
          In Development
        </span>
        <CardDescription>
          A dedicated space for tech enthusiasts, AI builders, and behind-the-scenes explorers who want to follow the platform's development journey, feature rollouts, and upcoming innovations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Exclusive Insider Updates – Get early access to new platform features, UI/UX enhancements, and backend improvements before public release.</span>
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <span>Behind-the-Scenes Tech Drops – Learn about AI integrations, automation tools, and development workflows powering the platform.</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Beta Testing & Feedback Loop – Help refine new features, participate in A/B testing, and provide direct feedback on technical implementations.</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Community of Builders – Connect with other AI enthusiasts, developers, and product innovators who are passionate about using tech to enhance caregiving solutions.</span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <Link to="/community/features-overview" className="block w-full">
            <Button className="w-full">
              Join the Innovators Hub 🚀
            </Button>
          </Link>
          <UpvoteFeatureButton
            featureTitle="Insider Access & Tech Innovators Hub"
            className="w-full"
            buttonText="Upvote this Feature"
          />
        </div>
      </CardContent>
    </Card>
  );
};
