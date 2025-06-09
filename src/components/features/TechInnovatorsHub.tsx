
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Sparkles, Code, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

export const TechInnovatorsHub = () => {
  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
      <div className="absolute top-4 right-4">
        <Sparkles className="h-6 w-6 text-primary/40 animate-pulse" />
      </div>
      <div className="absolute bottom-2 left-2">
        <Code className="h-4 w-4 text-primary/30" />
      </div>
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              🚀 Insider Access & Tech Innovators Hub
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Join our exclusive community of tech innovators and early adopters
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white/50 rounded-lg p-4 border border-primary/20">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-sm text-gray-800">Early Access to New Features</p>
                <p className="text-xs text-gray-600">Be the first to test and shape upcoming features</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-sm text-gray-800">Direct Developer Feedback</p>
                <p className="text-xs text-gray-600">Share ideas directly with our engineering team</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-sm text-gray-800">Exclusive Tech Previews</p>
                <p className="text-xs text-gray-600">Get behind-the-scenes looks at our technology stack</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-sm text-gray-800">Innovation Partner Status</p>
                <p className="text-xs text-gray-600">Collaborate on cutting-edge care technology solutions</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/features#tech-innovators-hub" className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
              <Rocket className="mr-2 h-4 w-4" />
              Join Innovators Hub
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/5">
            <Code className="mr-2 h-3 w-3" />
            Learn More
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 italic">
            Limited spots available • By invitation and application
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
