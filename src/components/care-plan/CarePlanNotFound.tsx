
import React from 'react';
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CarePlanNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Container className="py-12">
      <Card>
        <div className="flex flex-col p-6">
          <h2 className="text-2xl font-semibold mb-2">Care Plan Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested care plan could not be found.
          </p>
          <Button onClick={() => navigate("/family/care-management")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Care Management
          </Button>
        </div>
      </Card>
    </Container>
  );
};
