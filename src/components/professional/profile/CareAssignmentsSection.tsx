
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CareAssignmentsSection = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        console.log("Fetching care assignments for profile hub...");
        
        // Get care team assignments where the professional is a member
        const { data, error } = await supabase
          .from('care_team_members')
          .select(`
            id, 
            status,
            role,
            care_plan_id,
            family_id,
            care_plan:care_plan_id(
              id,
              title,
              description,
              status,
              family_profile:family_id(
                id,
                full_name,
                avatar_url
              )
            )
          `)
          .eq('caregiver_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching care assignments for profile hub:", error);
          throw error;
        }
        
        console.log("Care assignments loaded for profile hub:", data);
        setAssignments(data || []);
      } catch (error) {
        console.error("Failed to load care assignments:", error);
        toast.error("Failed to load your care assignments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [user]);
  
  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    if (!name) return "FP";
    
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary"/>
          Your Care Assignments
        </CardTitle>
        <CardDescription>
          Care plans you are assigned to
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              // Handle possible null data with fallbacks
              const carePlanData = assignment.care_plan || {};
              const familyProfile = carePlanData?.family_profile || {};
              
              return (
                <div 
                  key={assignment.id} 
                  className="border rounded-md p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={familyProfile.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {getInitials(familyProfile.full_name || 'Family')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{carePlanData.title || 'Unnamed Plan'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {familyProfile.full_name || 'Family'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        assignment.status === 'active' ? 'bg-green-100 text-green-800' : 
                        assignment.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {assignment.status || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <Link to={`/professional/assignments/${assignment.care_plan_id}`}>
                      <Button variant="default" size="sm">
                        View Plan Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            <Link to="/professional/schedule" className="block">
              <Button variant="outline" className="w-full mt-2">
                View All Care Assignments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No care assignments yet</h3>
            <p className="text-gray-500 mb-6">
              You'll see care plans here once families assign you to their care team
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareAssignmentsSection;
