
import { FadeIn } from "@/components/framer";

const DashboardHeader = () => {
  return (
    <FadeIn duration={0.5} className="space-y-6">
      <h1 className="text-3xl font-bold">Professional Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Manage your caregiving services and professional development.
      </p>
    </FadeIn>
  );
};

export default DashboardHeader;
