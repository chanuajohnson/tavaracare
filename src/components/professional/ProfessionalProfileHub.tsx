import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { User, FileText, Settings, Users, Award, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrainingProgramSection } from "./TrainingProgramSection";
import { TrainingModulesSection } from "./TrainingModulesSection";
import { TrainingProgressTracker } from "./TrainingProgressTracker";

export const ProfessionalProfileHub = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTrainingExpanded, setIsTrainingExpanded] = useState(false);

  // Check URL params for tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      setProfileData(profile);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Professional Profile Hub</h1>
          <p className="text-gray-600 mt-2">Manage your professional profile and access resources</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="admin-assistant" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin Assistant
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>
                  Your professional profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg">{profileData?.full_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Professional Type</label>
                    <p className="text-lg">{profileData?.professional_type || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                    <p className="text-lg">{profileData?.years_of_experience || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Documents</CardTitle>
                <CardDescription>
                  Manage your certifications and professional documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Document management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Configure your professional profile settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin-assistant" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Administrative Assistant</CardTitle>
                <CardDescription>
                  Tools and resources to help with administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Training Section */}
                  <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setIsTrainingExpanded(!isTrainingExpanded)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 text-white p-2 rounded-lg">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Professional Training</h3>
                          <p className="text-sm text-gray-600">Access training modules and track your progress</p>
                        </div>
                      </div>
                      {isTrainingExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    {isTrainingExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 space-y-6"
                      >
                        <TrainingProgressTracker />
                        <TrainingProgramSection />
                        <TrainingModulesSection />
                      </motion.div>
                    )}
                  </div>

                  {/* Other Admin Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-500 text-white p-2 rounded-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">Care Documentation</h4>
                            <p className="text-sm text-gray-600">Generate care reports and notes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500 text-white p-2 rounded-lg">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">Team Coordination</h4>
                            <p className="text-sm text-gray-600">Coordinate with care team members</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
