
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CarePlan } from "@/types/carePlan";

interface CarePlanHeaderProps {
  carePlan: CarePlan;
}

export const CarePlanHeader: React.FC<CarePlanHeaderProps> = ({ carePlan }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromProfessional = searchParams.get('from') === 'professional';

  const handleBack = () => {
    if (fromProfessional) {
      navigate("/professional/profile");
    } else {
      navigate("/family/care-management");
    }
  };

  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {fromProfessional ? 'Back to Profile Hub' : 'Back to Care Plans'}
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{carePlan?.title}</h1>
          <p className="text-muted-foreground mt-1">
            {carePlan?.description || "No description provided"}
          </p>
        </div>
        
        <Badge className={`${
          carePlan?.status === 'active' ? 'bg-green-100 text-green-800' :
          carePlan?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {carePlan?.status.charAt(0).toUpperCase() + carePlan?.status.slice(1)}
        </Badge>
      </div>
    </div>
  );
};
