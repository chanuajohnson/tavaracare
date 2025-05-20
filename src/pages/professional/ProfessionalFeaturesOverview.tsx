
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, UserCog, FileText, BookOpen, Building } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const ProfessionalFeaturesOverview = () => {
  const breadcrumbItems = [
    {
      label: "Professional",
      path: "/dashboard/professional",
    },
    {
      label: "Features Overview",
      path: "/professional/features-overview",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold">Professional Features Overview</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            Explore all the features available to professional caregivers on our platform. These tools and resources are designed to enhance your caregiving experience and professional development.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Profile Management
                </CardTitle>
                <CardDescription>
                  Manage your professional profile and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Update your personal information, professional credentials, skills, experience, and availability preferences in one centralized location.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Personal Information Management</li>
                    <li className="text-sm text-gray-600">Professional Credentials Verification</li>
                    <li className="text-sm text-gray-600">Skills & Experience Showcase</li>
                    <li className="text-sm text-gray-600">Availability & Preferences Settings</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700 font-medium">Status: In Development</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Admin Assistant Tools
                </CardTitle>
                <CardDescription>
                  Streamline your administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Access a suite of administrative tools designed specifically for professional caregivers to manage documentation, compliance, and more efficiently.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Job Letter Generation</li>
                    <li className="text-sm text-gray-600">NIS Registration Assistance</li>
                    <li className="text-sm text-gray-600">Document Management System</li>
                    <li className="text-sm text-gray-600">Administrative Support Resources</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700 font-medium">Status: In Development</p>
              </CardContent>
            </Card>

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
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">Enhance your professional development with our extensive training resources, certification courses, and specialized care guidelines.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li className="text-sm text-gray-600">Certification Courses & Programs</li>
                    <li className="text-sm text-gray-600">Professional Skill Development</li>
                    <li className="text-sm text-gray-600">Best Practices & Care Guidelines</li>
                    <li className="text-sm text-gray-600">Specialized Care Training Modules</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700 font-medium">Status: Planned</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Professional Agency Hub
                </CardTitle>
                <CardDescription>
                  Comprehensive agency management features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  <p className="text-sm text-gray-600">A dedicated suite of tools for professional caregiving agencies to manage caregivers, client relationships, and streamline operations.</p>
                  
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
                <p className="text-sm text-gray-700 font-medium">Status: Coming Soon</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Want to see these features developed sooner? Let us know what's important to you!</p>
            <Link to="/features">
              <Button 
                variant="default"
                className="bg-primary hover:bg-primary-600 text-white"
              >
                Vote for Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessionalFeaturesOverview;
