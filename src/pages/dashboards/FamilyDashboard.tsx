
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Calendar, PenSquare, ChefHat, ActivitySquare, Users, Bell, Pill, ArrowRight, UserCog } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";

const FamilyDashboard = () => {
  const { user, isProfileComplete } = useAuth();
  const breadcrumbItems = [{ label: "Family", href: "/dashboard/family" }];

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
          {!user ? (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8 border border-green-100">
              <h2 className="text-2xl font-bold mb-2">Welcome to Takes a Village! 🚀 Your Care Coordination Hub.</h2>
              <p className="text-gray-600 mb-4">We're building this platform with you in mind. Explore features, connect with caregivers, and help shape the future of care by voting on features!</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    View Care Plans
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Find a Caregiver
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Upvote Features
                  </Button>
                </Link>
              </div>
            </div>
          ) : !isProfileComplete ? (
            <div className="bg-yellow-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 mb-4">Please complete your profile to access all features.</p>
              <Link to="/registration/family">
                <Button variant="default" size="lg" className="float-right">
                  Complete Profile
                </Button>
              </Link>
            </div>
          ) : null}

          <h1 className="text-3xl font-semibold mb-4">Welcome to Takes a Village</h1>
          <p className="text-gray-600 mb-8">Comprehensive care coordination platform.</p>

          {/* Edit Profile Card - Replacing Preview Mode Card */}
          {(user && isProfileComplete) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  Edit Profile
                </CardTitle>
                <CardDescription>Update your profile information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/profile">
                  <Button 
                    variant="default" 
                    className="w-full"
                  >
                    Manage Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton 
                  featureTitle="Profile Management" 
                  className="w-full" 
                  buttonText="Upvote this Feature" 
                />
              </CardContent>
            </Card>
          )}

          {/* Care Management Section */}
          <div className="space-y-6 mb-8">
            <Card className="mb-2">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Care Management</CardTitle>
                <CardDescription>Manage care plans, team members, appointments and more</CardDescription>
              </CardHeader>
              <CardContent>
                <UpvoteFeatureButton featureTitle="Care Management" className="w-full mb-6" buttonText="Upvote this Feature" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Quick Action Cards */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        New Care Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">Create Plan</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-primary" />
                        Add Team Member
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">Add Member</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        Schedule Appointment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">Schedule</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="h-5 w-5 text-primary" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">View</Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Care Plans
                      </CardTitle>
                      <CardDescription>View and manage care plans</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">View Plans</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Care Team
                      </CardTitle>
                      <CardDescription>Manage your care team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">View Team</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Appointments
                      </CardTitle>
                      <CardDescription>Schedule and manage appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full">View Calendar</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Medication Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Medications
                </CardTitle>
                <CardDescription>View and manage medications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Medications</Button>
                <UpvoteFeatureButton featureTitle="Medications" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Schedule
                </CardTitle>
                <CardDescription>Manage medication schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Schedule</Button>
                <UpvoteFeatureButton featureTitle="Medication Schedule" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Planning
                </CardTitle>
                <CardDescription>Plan medication routines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Planning</Button>
                <UpvoteFeatureButton featureTitle="Medication Planning" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5 text-primary" />
                  Administration
                </CardTitle>
                <CardDescription>Track medication administration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Administration</Button>
                <UpvoteFeatureButton featureTitle="Medication Administration" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Meal Planning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Select Date
                </CardTitle>
                <CardDescription>Pick a date for meal planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Pick a date</p>
                </div>
                <UpvoteFeatureButton featureTitle="Meal Planning Date Selection" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Meal Types
                </CardTitle>
                <CardDescription>Choose meal types for planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-500">Morning Drink</p>
                    <p className="text-gray-500">Morning Snack</p>
                    <p className="text-gray-500">Afternoon Snack</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500">Breakfast</p>
                    <p className="text-gray-500">Lunch</p>
                    <p className="text-gray-500">Dinner</p>
                  </div>
                </div>
                <UpvoteFeatureButton featureTitle="Meal Types Selection" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Recipe Library
                </CardTitle>
                <CardDescription>Browse and manage recipes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Library</Button>
                <UpvoteFeatureButton featureTitle="Recipe Library" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ActivitySquare className="h-5 w-5 text-primary" />
                  Suggestions
                </CardTitle>
                <CardDescription>Get personalized meal suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="secondary" className="w-full">View Suggestions</Button>
                <UpvoteFeatureButton featureTitle="Meal Suggestions" className="w-full" buttonText="Upvote this Feature" />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your care plans and meal activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No recent activities</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
