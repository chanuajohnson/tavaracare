
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  FileText 
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

interface CarePlan {
  id: string;
  title: string;
  description: string;
  status: string;
  family_name: string;
  team_count: number;
  upcoming_shifts: number;
}

export const CarePlansList = () => {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchCarePlans = async () => {
      setLoading(true);
      try {
        // Get care team memberships for the current professional
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('care_team_members')
          .select('care_plan_id')
          .eq('caregiver_id', user.id);
        
        if (membershipError) throw membershipError;
        
        if (!teamMemberships || teamMemberships.length === 0) {
          setCarePlans([]);
          setLoading(false);
          return;
        }
        
        // Get the care plan details
        const carePlanIds = teamMemberships.map(tm => tm.care_plan_id);
        const { data: carePlansData, error: plansError } = await supabase
          .from('care_plans')
          .select(`
            id, 
            title, 
            description, 
            status,
            profiles:family_id (full_name)
          `)
          .in('id', carePlanIds);
        
        if (plansError) throw plansError;
        
        // Get team count for each care plan
        const plansWithDetails = await Promise.all((carePlansData || []).map(async (plan) => {
          // Get team count
          const { count: teamCount, error: teamError } = await supabase
            .from('care_team_members')
            .select('id', { count: 'exact', head: true })
            .eq('care_plan_id', plan.id);
            
          if (teamError) throw teamError;
          
          // Get upcoming shifts count
          const now = new Date();
          const { count: shiftsCount, error: shiftsError } = await supabase
            .from('care_shifts')
            .select('id', { count: 'exact', head: true })
            .eq('care_plan_id', plan.id)
            .eq('caregiver_id', user.id)
            .gt('start_time', now.toISOString());
            
          if (shiftsError) throw shiftsError;
          
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            status: plan.status,
            family_name: plan.profiles?.full_name || 'Unknown Family',
            team_count: teamCount || 0,
            upcoming_shifts: shiftsCount || 0
          };
        }));
        
        setCarePlans(plansWithDetails);
      } catch (error) {
        console.error("Error fetching care plans:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarePlans();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (carePlans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Care Plans Assigned</h3>
          <p className="text-muted-foreground text-center mt-2">
            You haven't been assigned to any care plans yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {carePlans.map(plan => (
        <Card key={plan.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{plan.title}</CardTitle>
              <Badge 
                className={
                  plan.status === 'active' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }
              >
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Family: {plan.family_name}</p>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm line-clamp-2 mb-4">
              {plan.description || 'No description available'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>Team: {plan.team_count}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Shifts: {plan.upcoming_shifts}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to={`/professional/care-plan/${plan.id}`} className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                View Care Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
