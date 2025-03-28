
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ClipboardEdit, ArrowRight, UserCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function ProfessionalShortcutMenuBar() {
  const { user } = useAuth();
  
  return (
    <div className="bg-muted py-2 border-y">
      <Container>
        <div className="flex items-center overflow-x-auto whitespace-nowrap py-1 gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Access:</span>
          <Link to="/registration/professional">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ClipboardEdit className="h-4 w-4" />
              <span>Complete Registration</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/professional/profile">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>Profile Hub</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
