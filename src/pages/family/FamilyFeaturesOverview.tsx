
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCog, FileText, Pill, ChefHat } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const FamilyFeaturesOverview = () => {
  const breadcrumbItems = [
    {
      label: "Family",
      path: "/dashboard/family",
    },
    {
      label: "Features Overview",
      path: "/family/features-overview",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <h1 className="text-3xl font-bold">Family Features Overview</h1>
        <p className="text-muted-foreground mt-2 mb-8">
          Our family dashboard is designed to help you coordinate care more effectively. Explore the features below, and help us improve by upvoting the ones you'd like to see developed first.
        </p>

        <div className="space-y-6">
          {/* Profile Management */}
          <div className="border rounded-lg bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <UserCog className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Profile Management</h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Manage your family's profile information and preferences
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Keep your family profile up-to-date to ensure you receive the most relevant care coordination 
              support and recommendations. The profile management feature allows you to:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li className="text-sm text-gray-600">Update contact information for all family members</li>
              <li className="text-sm text-gray-600">Manage privacy settings and data sharing preferences</li>
              <li className="text-sm text-gray-600">Set communication preferences for notifications and reminders</li>
              <li className="text-sm text-gray-600">Customize dashboard appearance and organization</li>
            </ul>
            
            <p className="text-sm text-gray-700 font-medium mb-3">Status: In Development</p>
          </div>

          {/* Care Management */}
          <div className="border rounded-lg bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Care Management</h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Coordinate care plans, team members, and appointments
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Simplify the complex task of care coordination with our comprehensive care management tools.
              These features help you:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li className="text-sm text-gray-600">Create and manage detailed care plans for family members</li>
              <li className="text-sm text-gray-600">Add and coordinate with care team members, including professionals and community support</li>
              <li className="text-sm text-gray-600">Schedule and track appointments with automatic reminders</li>
              <li className="text-sm text-gray-600">Share care plans securely with authorized healthcare providers</li>
              <li className="text-sm text-gray-600">Track progress against care goals with simple visualizations</li>
            </ul>
            
            <p className="text-sm text-gray-700 font-medium mb-3">Status: In Development</p>
          </div>

          {/* Medication Management */}
          <div className="border rounded-lg bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Pill className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Medication Management</h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Track and manage medications, schedules, and administration
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Our medication management tools help you stay on top of complex medication regimens
              for your family members:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li className="text-sm text-gray-600">Create detailed medication lists with dosage information</li>
              <li className="text-sm text-gray-600">Set up medication schedules with customizable reminders</li>
              <li className="text-sm text-gray-600">Track administration and adherence over time</li>
              <li className="text-sm text-gray-600">Monitor for potential drug interactions</li>
              <li className="text-sm text-gray-600">Generate medication reports for healthcare providers</li>
            </ul>
            
            <p className="text-sm text-gray-700 font-medium mb-3">Status: In Development</p>
          </div>

          {/* Meal Planning */}
          <div className="border rounded-lg bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Meal Planning</h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Plan and manage meals, recipes, and nutrition
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              Simplify meal planning while ensuring nutritional needs are met with our comprehensive
              meal planning tools:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li className="text-sm text-gray-600">Create weekly meal plans customized to dietary needs</li>
              <li className="text-sm text-gray-600">Access a recipe library with nutrition information</li>
              <li className="text-sm text-gray-600">Generate shopping lists based on meal plans</li>
              <li className="text-sm text-gray-600">Schedule meal preparation tasks and reminders</li>
              <li className="text-sm text-gray-600">Track nutrition intake and dietary adherence</li>
            </ul>
            
            <p className="text-sm text-gray-700 font-medium mb-3">Status: Planned</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Want to see these features developed sooner? Let us know what's important to you!</p>
          <Link to="/features">
            <Button 
              className="bg-primary hover:bg-primary-600 text-white"
            >
              Vote for Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FamilyFeaturesOverview;
