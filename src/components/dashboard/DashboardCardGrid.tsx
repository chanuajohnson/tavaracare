
import { Book, UserCog, FileText, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { FadeIn } from "@/components/framer";

export const DashboardCardGrid = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Profile Management Card */}
      <FadeIn
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Profile Management
            </CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Personal information and settings</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Professional qualifications</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Contact preferences</span>
              </li>
            </ul>
            <Link to="/registration/professional">
              <Button className="w-full">Manage Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Resources Card */}
      <FadeIn
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>
              Access training materials and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Training modules</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Best practices guides</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Certification paths</span>
              </li>
            </ul>
            <Link to="/professional/training-resources">
              <Button className="w-full">View Resources</Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Documentation Card */}
      <FadeIn
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>Review and manage your documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Forms and templates</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Policies and procedures</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Reports and analytics</span>
              </li>
            </ul>
            <Link to="/professional/features-overview">
              <Button className="w-full">View Documentation</Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
};
