
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Fab } from "@/components/ui/fab";
import { HelpCircle } from "lucide-react";
import { ChatbotSystem } from "@/components/chatbot/ChatbotSystem";
import { Hero } from "@/components/home/Hero";
import { RoleSection } from "@/components/home/RoleSection";
import { FeatureVotingSection } from "@/components/home/FeatureVotingSection";
import { roles, communityRole } from "@/components/home/RoleData";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleRoleSelect = (roleId: string) => {
    if (roleId === "community") {
      setSelectedRole(roleId);
      navigate(communityRole.path);
      toast.success(`Welcome to the ${communityRole.title} Dashboard! Sign in to access all features.`);
    } else {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        setSelectedRole(roleId);
        navigate(role.path);
        toast.success(`Welcome to the ${role.title} Dashboard! Sign in to access all features.`);
      }
    }
  };

  const handleGetStarted = () => {
    comparisonRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-primary-100">
      <div className="container px-4 py-12 mx-auto">
        <Hero handleGetStarted={handleGetStarted} />

        <RoleSection 
          roles={roles} 
          communityRole={communityRole}
          onRoleSelect={handleRoleSelect}
          comparisonRef={comparisonRef}
        />

        <FeatureVotingSection />
      </div>
      
      <ChatbotSystem />
      
      <Fab
        position="bottom-right"
        icon={<HelpCircle className="h-5 w-5" />}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      />
    </div>
  );
};

export default Index;
