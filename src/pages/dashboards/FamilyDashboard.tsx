
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { DashboardTracker } from "@/components/tracking/DashboardTracker";
import { FamilyShortcutMenuBar } from "@/components/family/FamilyShortcutMenuBar";

// Import the refactored components
import { WelcomeSection } from "@/components/family/dashboard/WelcomeSection";
import { CareNeedsSection } from "@/components/family/dashboard/CareNeedsSection";
import { ProfileManagementSection } from "@/components/family/dashboard/ProfileManagementSection";
import { CareManagementSection } from "@/components/family/dashboard/CareManagementSection";
import { MedicationManagementSection } from "@/components/family/dashboard/MedicationManagementSection";
import { MealPlanningSection } from "@/components/family/dashboard/MealPlanningSection";
import { RecentActivitySection } from "@/components/family/dashboard/RecentActivitySection";
import { DashboardGrid } from "@/components/family/dashboard/DashboardGrid";
import { FamilyNextStepsPanel } from "@/components/family/FamilyNextStepsPanel";
import { CaregiverMatchingCard } from "@/components/family/CaregiverMatchingCard";
import { CaregiverHealthCard } from "@/components/professional/CaregiverHealthCard";
import { TellTheirStoryCard } from "@/components/family/TellTheirStoryCard";
import { DashboardCaregiverMatches } from "@/components/family/DashboardCaregiverMatches";

const FamilyDashboard = () => {
  const { user } = useAuth();
  const breadcrumbItems = [{ label: "Family Dashboard", path: "/dashboard/family" }];
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  
  useEffect(() => {
    if (user) {
      const loadProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          setProfileData(data);
        } catch (err) {
          console.error("Error loading profile data:", err);
        }
      };
      
      loadProfileData();
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_board_posts')
        .select('*')
        .ilike('location', '%Trinidad and Tobago%')
        .order('time_posted', { ascending: false })
        .limit(4);
        
      if (error) {
        throw error;
      }
      if (data) {
        console.log("Fetched Trinidad and Tobago messages:", data);
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load message board posts");
    } finally {
      setLoading(false);
    }
  };
  
  const refreshData = async () => {
    try {
      setRefreshing(true);
      toast.info("Refreshing Trinidad and Tobago message board data...");
      const { data, error } = await supabase.functions.invoke('update-job-data', {
        body: { region: 'Trinidad and Tobago' }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast.success(`Successfully refreshed data with ${data.postsCount} posts`);
        await fetchMessages();
      } else {
        throw new Error(data.error || "Failed to refresh data");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh message board data");
    } finally {
      setRefreshing(false);
    }
  };
  
  const formatTimePosted = timestamp => {
    if (!timestamp) return "Unknown";
    const posted = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - posted.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardTracker dashboardType="family" />
      <div className="container px-4 py-8">
        <DashboardHeader breadcrumbItems={breadcrumbItems} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-semibold mb-4">Family Dashboard</h1>
          <p className="text-gray-600 mb-2">Comprehensive care coordination platform.</p>
          
          <WelcomeSection user={user} profileData={profileData} />
          
          {user && <FamilyShortcutMenuBar />}

          <CareNeedsSection profileData={profileData} />
          
          <FamilyNextStepsPanel />
          
          <CaregiverMatchingCard />
          
          <CaregiverHealthCard className="mb-8" />
          
          <TellTheirStoryCard />

          <DashboardCaregiverMatches />

          <DashboardGrid
            messages={messages}
            loading={loading}
            refreshing={refreshing}
            refreshData={refreshData}
            formatTimePosted={formatTimePosted}
          />

          <ProfileManagementSection />
          
          <CareManagementSection />
          
          <MedicationManagementSection />
          
          <MealPlanningSection />
          
          <RecentActivitySection />
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
