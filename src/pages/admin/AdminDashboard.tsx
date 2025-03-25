
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";
import { FeatureInterestTracker } from "@/components/admin/FeatureInterestTracker";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";

const AdminDashboard = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
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
