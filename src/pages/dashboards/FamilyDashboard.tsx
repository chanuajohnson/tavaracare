import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Calendar, PenSquare, ChefHat, ActivitySquare, Users, Bell, Pill, ArrowRight, UserCog, Circle, List, CheckCircle2, MessageSquare } from "lucide-react";
import { UpvoteFeatureButton } from "@/components/features/UpvoteFeatureButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { FamilyPostCareNeedForm } from "@/components/family/FamilyPostCareNeedForm";
import { useNavigate } from "react-router-dom";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { DashboardCaregiverMatches } from "@/components/family/DashboardCaregiverMatches";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { FamilyShortcutMenuBar } from "@/components/family/FamilyShortcutMenuBar";

const FamilyDashboard = () => {
  const {
    user,
    isProfileComplete
  } = useAuth();
  const breadcrumbItems = [{
    label: "Family Dashboard",
    path: "/dashboard/family"
  }];
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [user]);
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('message_board_posts').select('*').ilike('location', '%Trinidad and Tobago%').order('time_posted', {
        ascending: false
      }).limit(4);
      if (error) {
        throw error;
      }
      if (data) {
        console.log("Fetched Trinidad and Tobago messages:", data);
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load message board posts");
    } finally {
      setLoading(false);
    }
  };
  const refreshData = async () => {
    try {
      setRefreshing(true);
      toast.info("Refreshing Trinidad and Tobago message board data...");
      const {
        data,
        error
      } = await supabase.functions.invoke('update-job-data', {
        body: {
          region: 'Trinidad and Tobago'
        }
      });
      if (error) {
        throw error;
      }
      if (data.success) {
        toast.success(`Successfully refreshed data with ${data.postsCount} posts`);
        await fetchMessages();
      } else {
        throw new Error(data.error || "Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh message board data");
    } finally {
      setRefreshing(false);
    }
  };
  const formatTimePosted = timestamp => {
    if (!timestamp) return "Unknown";
    const posted = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - posted.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };
  const handleViewFullBoard = () => {
    navigate('/subscription-features', {
      state: {
        returnPath: '/family/message-board',
        featureType: "Full Message Board"
      }
    });
  };
  const handleViewAllTasks = () => {
    navigate('/subscription-features', {
      state: {
        returnPath: '/dashboard/family',
        featureType: "All Tasks View",
        referringPagePath: '/dashboard/family',
        referringPageLabel: 'Family Dashboard'
      }
    });
  };
  return <div className="min-h-screen bg-background">
      <DashboardTracker dashboardType="family" />
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="space-y-6">
          {!user ? <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8 border border-green-100">
              <h2 className="text-2xl font-bold mb-2">Welcome to Tavara! 🚀 It takes a village to care.</h2>
              <p className="text-gray-600 mb-4">Connect with caregivers, explore features, and help shape the future of care</p>
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
            </div> : null}

          <h1 className="text-3xl font-semibold mb-4">Family Dashboard</h1>
          <p className="text-gray-600 mb-2">Comprehensive care coordination platform.</p>
          
          {user && <FamilyShortcutMenuBar />}

          <CaregiverMatchingCard />
          
          <TellTheirStoryCard />

          <DashboardCaregiverMatches />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
              <Card className="h-full border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Message Board
                  </CardTitle>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Care provider availability in Trinidad and Tobago</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleViewFullBoard} disabled={refreshing}>
                        <Clock className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        <span className="sr-only">Refresh</span>
                      </Button>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Professional</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div> : messages.length > 0 ? <div className="space-y-3">
                      {messages.filter(message => message.type === "professional").slice(0, 3).map(message => <div key={message.id} className="p-3 rounded-lg space-y-2 hover:bg-gray-50 transition-colors cursor-pointer border-l-2 bg-gray-50 border-l-primary-400">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Avatar className="bg-primary-200">
                                <AvatarFallback className="text-primary-800">
                                  {message.author_initial}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-sm">{message.title}</h4>
                                <p className="text-xs text-gray-600">{message.author}</p>
                              </div>
                            </div>
                            {message.urgency && <Badge variant="outline" className={message.urgency === "Immediate" ? "bg-red-50 text-red-700" : message.urgency === "Short Notice" ? "bg-orange-50 text-orange-700" : message.urgency === "This Weekend" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}>
                                {message.urgency}
                              </Badge>}
                          </div>
                          
                          <p className="text-xs text-gray-600">{message.details}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.specialties && message.specialties.map((specialty, index) => <Badge key={index} variant="outline" className="text-xs bg-white">
                                {specialty}
                              </Badge>)}
                          </div>
                          
                          <div className="flex justify-between items-center pt-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Posted {formatTimePosted(message.time_posted)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{message.location}</span>
                            </div>
                          </div>
                        </div>)}
                    </div> : <div className="text-center py-6">
                      <p className="text-gray-500">No care providers found in Trinidad and Tobago</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={refreshData} disabled={refreshing}>
                        Refresh Data
                      </Button>
                    </div>}
                  
                  <SubscriptionFeatureLink featureType="Full Message Board" returnPath="/family/message-board" referringPagePath="/dashboard/family" referringPageLabel="Family Dashboard">
                    View Full Message Board
                  </SubscriptionFeatureLink>
                </CardContent>
              </Card>
            </motion.div>

            <FamilyPostCareNeedForm />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Profile Management
              </CardTitle>
              <CardDescription>Manage your profile information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Keep your profile up-to-date to ensure you receive the most relevant care coordination support and recommendations.</p>
              <Link to="/registration/family">
                <Button variant="default" className="w-full">
                  Manage Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <UpvoteFeatureButton featureTitle="Profile Management" className="w-full" buttonText="Upvote this Feature" />
            </CardContent>
          </Card>

          <FamilyNextStepsPanel />

          <div className="space-y-6 mb-8">
            <Card className="mb-2">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Care Management</CardTitle>
                <CardDescription>Manage care plans, team members, appointments and more</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/family/features-overview">
                  <Button variant="default" className="w-full mb-6">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <UpvoteFeatureButton featureTitle="Care Management" className="w-full mb-6" buttonText="Upvote this Feature" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        New Care Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link to="/family/care-management">
                        <Button variant="secondary" className="w-full">Create Plan</Button>
                      </Link>
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
                      <Link to="/family/care-management">
                        <Button variant="secondary" className="w-full">Add Member</Button>
                      </Link>
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
                      <Link to="/family/care-management">
                        <Button variant="secondary" className="w-full">Schedule</Button>
                      </Link>
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
                      <Link to="/family/care-management">
                        <Button variant="secondary" className="w-full">View</Button>
                      </Link>
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
                      <Link to="/family/care-management">
                        <Button variant="secondary" className="w-full">View Plans</Button>
                      </Link>
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
                      <Link to="/family/care-management/team">
                        <Button variant="secondary" className="w-full">View Team</Button>
                      </Link>
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
                      <Link to="/family/care-management/schedule">
                        <Button variant="secondary" className="w-full">View Calendar</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Medication Management</CardTitle>
              <CardDescription>Track and manage medications, schedules, and administration</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/family/features-overview">
                <Button variant="default" className="w-full mb-6">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <UpvoteFeatureButton featureTitle="Medication Management" className="w-full mb-6" buttonText="Upvote this Feature" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Medications
                    </CardTitle>
                    <CardDescription>View and manage medications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link to="/family/features-overview">
                      <Button variant="secondary" className="w-full">View Medications</Button>
                    </Link>
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
                    <Link to="/family/features-overview">
                      <Button variant="secondary" className="w-full">View Schedule</Button>
                    </Link>
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
                    <Link to="/family/features-overview">
                      <Button variant="secondary" className="w-full">View Planning</Button>
                    </Link>
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
                    <Link to="/family/features-overview">
                      <Button variant="secondary" className="w-full">View Administration</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Meal Planning</CardTitle>
              <CardDescription>Plan and manage meals, recipes, and nutrition</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/family/features-overview">
                <Button variant="default" className="w-full mb-6">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <UpvoteFeatureButton featureTitle="Meal Planning" className="w-full mb-6" buttonText="Upvote this Feature" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <Link to="/family/features-overview" className="block mt-4">
                      <Button variant="secondary" className="w-full">Select Date</Button>
                    </Link>
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
                    <Link to="/family/features-overview" className="block mt-4">
                      <Button variant="secondary" className="w-full">Select Types</Button>
                    </Link>
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
                    <Link to="/family/features-overview">
                      <Button variant="secondary" className="w-full">View Library</Button>
                    </Link>
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
                    <Link to="/family/features-overview">
                      <Button variant="secondary" className="w-full">View Suggestions</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

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
    </div>;
};
export default FamilyDashboard;
