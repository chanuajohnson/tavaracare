
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { WhatsAppTemplateManager } from "@/components/admin/WhatsAppTemplateManager";
import { useAuth } from "@/components/providers/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, MessageSquare, Users, TrendingUp } from "lucide-react";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Admin",
      path: "/dashboard/admin",
    },
  ];

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          setUserRole(profile?.role || null);
        } catch (error) {
          console.error('Error checking user role:', error);
          setUserRole(null);
        }
      }
      setLoading(false);
    };

    checkAdminRole();
  }, [user?.id]);

  // Track admin dashboard visits
  useJourneyTracking({
    journeyStage: "admin_dashboard_visit",
    additionalData: {
      admin_section: "main_dashboard"
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show admin content if user is actually an admin
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Also add the component-based tracking for demonstration */}
        <UserJourneyTracker 
          journeyStage="admin_section_view" 
          additionalData={{ section: "admin_dashboard" }}
        />
        
        <DashboardHeader
          breadcrumbItems={breadcrumbItems}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage system settings, user accounts, and communication templates.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Link to="/admin/user-journey">
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <BarChart className="h-4 w-4" />
              User Journey Analytics
            </Button>
          </Link>
        </motion.div>

        <div className="space-y-8">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Templates
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Feature Analytics
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                System Overview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              <AdminUserManagement />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              <WhatsAppTemplateManager />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <FeatureInterestTracker />
            </TabsContent>
            
            <TabsContent value="overview" className="mt-6">
              <DashboardCardGrid />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
