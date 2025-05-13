
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/framer";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const ProfessionalAgencyCard = () => {
  return (
    <FadeIn delay={0.3} duration={0.5} className="mt-8">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Professional Agency
          </CardTitle>
          <CardDescription>
            Agency management features for professional caregivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 text-left">
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm">Professional Dashboard (Agency)</h4>
              <p className="text-xs text-gray-600 mt-1">A comprehensive agency management hub for overseeing caregivers, handling client relationships, and streamlining operations.</p>
              <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm">Access Professional Tools</h4>
              <p className="text-xs text-gray-600 mt-1">A resource hub providing administrative tools, job letter requests, and workflow management for caregivers and agencies.</p>
              <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm">Agency Training & Development Hub</h4>
              <p className="text-xs text-gray-600 mt-1">A training center for agencies offering certifications, compliance training, and workforce development.</p>
              <p className="text-xs text-gray-500 mt-1">Status: Planned</p>
            </div>
          </div>
          
          <Link to="/professional/features-overview">
            <Button 
              variant="default"
              className="w-full bg-primary hover:bg-primary-600 text-white"
            >
              Learn About Agency Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          <div className="pt-4">
            <UpvoteFeatureButton
              featureTitle="Professional Agency Management"
              buttonText="Upvote this Feature"
            />
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};

export default ProfessionalAgencyCard;
