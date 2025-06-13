
import React from "react";
import { ProfileHeaderSection } from "@/components/shared/ProfileHeaderSection";

export const AdminProfileHeaderSection = () => {
  return (
    <ProfileHeaderSection 
      role="admin"
      gradientColors="from-red-50 to-rose-50 border-red-100"
      badgeVariant="secondary"
    />
  );
};
