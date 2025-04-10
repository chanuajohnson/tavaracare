
import { Users, UserCog, Heart } from "lucide-react";

export const roles = [{
  id: "family",
  title: "Family",
  description: "Coordinate care for your loved ones",
  icon: Users,
  color: "bg-primary-100",
  path: "/dashboard/family",
  cta: "Find Care Now",
  features: ["Create and manage care plans", "Find qualified caregivers", "Track medications and appointments", "Coordinate with care team", "Monitor care activities", "Access care logs and reports"]
}, {
  id: "professional",
  title: "Professional",
  description: "Provide care services and expertise",
  icon: UserCog,
  color: "bg-primary-200",
  path: "/dashboard/professional",
  cta: "Get Hired as a Skilled Care Professional",
  features: ["Showcase qualifications", "Find care opportunities", "Manage client relationships", "Track care delivery", "Access training resources", "Professional development"]
}];

export const communityRole = {
  id: "community",
  title: "Community",
  description: "Support and contribute to care networks",
  icon: Heart,
  color: "bg-primary-300",
  path: "/dashboard/community",
  cta: "Join the Village",
  features: ["Join care circles", "Share local resources", "Participate in community events", "Offer support services", "Connect with families", "Track community impact"]
};
