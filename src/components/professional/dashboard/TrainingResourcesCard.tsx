
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/framer";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const TrainingResourcesCard = () => {
  return (
    <FadeIn delay={0.2} duration={0.5} className="mt-8">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Training Resources
          </CardTitle>
          <CardDescription>
            Access our comprehensive library of caregiving resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 mb-4 text-left">
            <p className="text-sm text-gray-600">Certification Courses</p>
            <p className="text-sm text-gray-600">Skill Development</p>
            <p className="text-sm text-gray-600">Best Practices Guides</p>
            <p className="text-sm text-gray-600">Specialized Care Training</p>
          </div>
          <Link to="/professional/training-resources">
            <Button 
              variant="default"
              className="w-full bg-primary hover:bg-primary-600 text-white"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="pt-4">
            <UpvoteFeatureButton
              featureTitle="Training Resources"
              buttonText="Upvote this Feature"
            />
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};

export default TrainingResourcesCard;
