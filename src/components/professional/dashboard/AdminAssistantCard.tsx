
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";

const AdminAssistantCard = () => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Admin Assistant
        </CardTitle>
        <CardDescription>
          Streamline your administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4 text-left">
          <p className="text-sm text-gray-600">Get Job Letters</p>
          <p className="text-sm text-gray-600">NIS Registration Assistance</p>
          <p className="text-sm text-gray-600">Document Management</p>
          <p className="text-sm text-gray-600">Administrative Support</p>
        </div>
        <Link to="/professional/features-overview">
          <Button 
            variant="default"
            className="w-full bg-primary hover:bg-primary-600 text-white"
          >
            Access Tools
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <div className="pt-4">
          <UpvoteFeatureButton
            featureTitle="Admin Assistant Tools"
            buttonText="Upvote this Feature"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAssistantCard;
