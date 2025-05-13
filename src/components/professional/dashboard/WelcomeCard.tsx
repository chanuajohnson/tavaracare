
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/framer";

const WelcomeCard = () => {
  return (
    <FadeIn delay={0.1} duration={0.5} className="my-8">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
        <CardContent className="p-0">
          <h2 className="text-2xl font-bold">Welcome to Tavara! 🚀 Your Care Coordination Hub.</h2>
          <p className="mt-2 text-gray-600">
            We're building this platform with you in mind. Explore features, connect with clients, and help shape the future of care by voting on features!
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/auth">
              <Button variant="default" size="sm">
                View Professional Tools
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Connect with Clients
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Upvote Features
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};

export default WelcomeCard;
