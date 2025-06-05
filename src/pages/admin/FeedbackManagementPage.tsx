
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FeedbackManagement } from "@/components/admin/FeedbackManagement";

const FeedbackManagementPage = () => {
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
      label: "Feedback Management",
      path: "/admin/feedback",
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
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-2">View, manage, and respond to user feedback across all categories.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FeedbackManagement />
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackManagementPage;
