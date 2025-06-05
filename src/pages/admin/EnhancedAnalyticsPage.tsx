
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const EnhancedAnalyticsPage = () => {
  const breadcrumbItems = [
    {
      label: "Admin",
      path: "/dashboard/admin",
    },
    {
      label: "Enhanced Analytics",
      path: "/admin/enhanced-analytics",
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive user journey tracking, sentiment analysis, and customer health insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnalyticsDashboard />
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsPage;
