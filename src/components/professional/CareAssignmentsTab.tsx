
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClipboardList, Calendar, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface CareAssignmentsTabProps {
  carePlans: any[];
  loading: boolean;
}

export function CareAssignmentsTab({ carePlans, loading }: CareAssignmentsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getFilteredAssignments = () => {
    if (statusFilter === "all") return carePlans;
    return carePlans.filter(plan => 
      plan.status === statusFilter || plan.care_plans?.status === statusFilter
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "F";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Care Assignments
          </CardTitle>
          <CardDescription>
            View and manage your care plan assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Care Assignments
        </CardTitle>
        <CardDescription>
          View and manage your care plan assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((plan) => {
              const carePlan = plan.care_plans;
              const familyProfile = carePlan?.profiles;

              return (
                <Card key={plan.id} className="overflow-hidden border">
                  <div className="p-4 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={familyProfile?.avatar_url} alt={familyProfile?.full_name || 'Family'} />
                          <AvatarFallback>
                            {getInitials(familyProfile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {familyProfile?.full_name || 'Family'}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>Updated {formatRelativeTime(carePlan?.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={
                        carePlan?.status === "active" ? "success" : 
                        carePlan?.status === "pending" ? "outline" : 
                        "secondary"
                      }>
                        {carePlan?.status?.charAt(0).toUpperCase() + carePlan?.status?.slice(1) || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-1">{carePlan?.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {carePlan?.description || "No description available"}
                    </p>
                    
                    {carePlan?.metadata && (
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Plan Type: {carePlan.metadata.planType}</span>
                        </div>
                        
                        {carePlan.metadata.weekdayCoverage && (
                          <div className="text-muted-foreground">
                            Weekdays: {carePlan.metadata.weekdayCoverage}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 flex justify-end">
                      <Link to={`/professional/assignments/${carePlan?.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                        >
                          View Details
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md bg-muted/20">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-medium">No care assignments found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You don't have any care assignments matching the selected filter
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
