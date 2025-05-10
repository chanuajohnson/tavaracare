import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CarePlan } from "@/types/carePlan";
interface CarePlanHeaderProps {
  carePlan: CarePlan;
}
export const CarePlanHeader: React.FC<CarePlanHeaderProps> = ({
  carePlan
}) => {
  const navigate = useNavigate();
  return <div className="mb-6">
      
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{carePlan?.title}</h1>
          <p className="text-muted-foreground mt-1">
            {carePlan?.description || "No description provided"}
          </p>
        </div>
        
        <Badge className={`${carePlan?.status === 'active' ? 'bg-green-100 text-green-800' : carePlan?.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
          {carePlan?.status.charAt(0).toUpperCase() + carePlan?.status.slice(1)}
        </Badge>
      </div>
    </div>;
};