
import React from "react";
import { Button } from "@/components/ui/button";

interface RegistrationLinkProps {
  role?: string | null;
}

export const RegistrationLink: React.FC<RegistrationLinkProps> = ({ role }) => {
  if (!role) return null;

  return (
    <div className="border-t border-b p-2 text-center">
      <Button
        variant="link"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={() => {
          window.location.href = `/registration/${role}`;
        }}
      >
        I'd rather fill out a quick form →
      </Button>
    </div>
  );
};
