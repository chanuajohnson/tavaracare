
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Calendar, ArrowUpRight, Clock, Activity, Plus } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const UserJourneyPage = () => {
  const [userId, setUserId] = useState<string>("");
  const [journeyData, setJourneyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Admin",
      path: "/dashboard/admin",
    },
    {
      label: "User Journey",
      path: "/admin/user-journey",
    },
  ];

  const fetchUserJourneyData = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch user journey tracking data
      const { data: journeyData, error: journeyError } = await supabase
        .from("cta_engagement_tracking")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (journeyError) {
        throw journeyError;
      }

      setJourneyData(journeyData || []);
      if (journeyData?.length === 0) {
        toast.info("No journey data found for this user");
      }
    } catch (error: any) {
      console.error("Error fetching user journey data:", error);
      toast.error(`Error fetching data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a test record function for debugging
  const addTestRecord = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID first");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("cta_engagement_tracking")
        .insert({
          user_id: userId,
          action_type: "test_journey_event",
          session_id: "test-session-id",
          additional_data: {
            path: "/admin/user-journey",
            journey_stage: "testing",
            test_record: true,
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        throw error;
      }

      toast.success("Test record added successfully");
      // Refetch the data to show the new record
      fetchUserJourneyData();
      
    } catch (error: any) {
      console.error("Error adding test record:", error);
      toast.error(`Error adding test record: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fill in the restricted user ID if current user is admin
  useEffect(() => {
    if (user?.id === '605540d7-ae87-4a7c-9bd0-5699937f0670') {
      setUserId('605540d7-ae87-4a7c-9bd0-5699937f0670');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">User Journey Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze user journey across the platform.
          </p>
        </motion.div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={fetchUserJourneyData} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Look Up User
              </Button>
              
              {/* Debug button for adding a test record */}
              {user?.id === '605540d7-ae87-4a7c-9bd0-5699937f0670' && (
                <Button 
                  onClick={addTestRecord} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Test Record
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {journeyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">User Journey Timeline</h2>
            <div className="space-y-4">
              {journeyData.map((event, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 p-2 rounded-full">
                        {event.action_type.includes('click') ? (
                          <ArrowUpRight className="h-5 w-5 text-primary-600" />
                        ) : event.action_type.includes('view') ? (
                          <Activity className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg capitalize">
                            {event.action_type.replace(/_/g, ' ')}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Context Data:</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(event.additional_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {journeyData.length === 0 && !isLoading && userId && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600">No Journey Data Found</h3>
            <p className="text-gray-500 mt-2">
              There is no tracking data available for this user ID.
            </p>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>
                To track user journeys across your application, you can use the <code>UserJourneyTracker</code> component.
                Here's how to implement it:
              </p>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<UserJourneyTracker 
  journeyStage="feature_discovery" 
  additionalData={{ feature: "caregiver_matching" }}
/>`}
              </pre>
              <p className="mt-4">
                Common journey stages include:
              </p>
              <ul className="list-disc pl-5">
                <li>first_visit</li>
                <li>authentication</li>
                <li>profile_creation</li>
                <li>feature_discovery</li>
                <li>subscription_consideration</li>
                <li>active_usage</li>
              </ul>
              
              <p className="mt-4 text-amber-600">
                <strong>Troubleshooting:</strong> If you're not seeing journey data for a user, ensure that:
              </p>
              <ul className="list-disc pl-5 text-amber-700">
                <li>The user has visited pages with <code>UserJourneyTracker</code> components</li>
                <li>The user was authenticated during those visits</li>
                <li>The correct user ID is being used for lookup</li>
                <li>There are no RLS policy restrictions preventing data access</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserJourneyPage;
