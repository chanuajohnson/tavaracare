
import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardRegistrationCard } from "@/components/dashboard/DashboardRegistrationCard";
import { DashboardCardGrid } from "@/components/dashboard/DashboardCardGrid";

const ProfessionalDashboard = () => {
  const { session, handleSignOut, isLoading } = useSession();

  const breadcrumbItems = [
    { label: "Home", link: "/" },
    { label: "Professional Dashboard", link: "/dashboard/professional" }
  ];

  const loginUrl = `/auth?returnTo=${encodeURIComponent('/dashboard/professional')}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-8 rounded-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-52"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-12 mx-auto">
        <DashboardHeader 
          breadcrumbItems={breadcrumbItems}
          session={session}
          onSignOut={handleSignOut}
          loginUrl={loginUrl}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your caregiving services and professional development.</p>
        </motion.div>

        <DashboardRegistrationCard session={session} />
        <DashboardCardGrid session={session} />
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
