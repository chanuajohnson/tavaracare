
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { CareAssignmentsTab } from "@/components/professional/CareAssignmentsTab";

const CareAssignmentsPage = () => {
  const { user } = useAuth();
  
  const breadcrumbItems = [
    {
      label: "Professional Dashboard",
      path: "/dashboard/professional",
    },
    {
      label: "Care Assignments",
      path: "/professional/care-assignments",
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to view your care assignments</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Care Assignments</h1>
          <p className="text-muted-foreground mt-2">
            Manage your care assignments, teams, and schedule.
          </p>
          
          <CareAssignmentsTab />
        </motion.div>
      </div>
    </div>
  );
};

export default CareAssignmentsPage;
