
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { User, FileText, Settings, Shield } from "lucide-react";
import { CertificateUpload } from "@/components/professional/CertificateUpload";
import { VerificationStatusCard } from "@/components/professional/VerificationStatusCard";

export const PersonalProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
          <h1 className="text-3xl font-bold text-gray-900">Personal Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal profile, documents and verification status</p>
        </motion.div>

        {/* Verification Status - Show prominently at top */}
        <div className="mb-6">
          <VerificationStatusCard onStatusChange={() => {}} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>
                  Your personal profile information
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Background Check Status</label>
                    <p className="text-lg capitalize">{profileData?.background_check_status?.replace('_', ' ') || "Not started"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Professional Documents & Verification
                </CardTitle>
                <CardDescription>
                  Upload and manage your professional certifications and background check documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateUpload onUploadSuccess={fetchProfileData} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Configure your personal profile settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
