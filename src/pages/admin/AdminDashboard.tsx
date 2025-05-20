
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { useAuth } from "@/components/providers/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import { UserJourneyTracker } from "@/components/tracking/UserJourneyTracker";
import { useJourneyTracking } from "@/hooks/useJourneyTracking";

const AdminDashboard = () => {
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
  ];

  // Track admin dashboard visits
  useJourneyTracking({
    journeyStage: "admin_dashboard_visit",
    additionalData: {
      admin_section: "main_dashboard"
    }
  });

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
          <p className="text-gray-600 mt-2">Manage system settings and user accounts.</p>
        </motion.div>

        {user?.id === '605540d7-ae87-4a7c-9bd0-5699937f0670' && (
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
        )}

        <div className="space-y-8">
          <AdminUserManagement />
          
          <div className="mt-8">
            <FeatureInterestTracker />
          </div>

          <DashboardCardGrid />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
