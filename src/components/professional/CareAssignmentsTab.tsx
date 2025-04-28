
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareAssignmentCard } from "@/components/professional/CareAssignmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, AlertCircle } from "lucide-react";

interface CareAssignmentsTabProps {
  carePlans: any[];
  loading: boolean;
}

export function CareAssignmentsTab({ carePlans, loading }: CareAssignmentsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const filteredPlans = carePlans.filter(plan => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      plan.care_plans?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.care_plans?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.care_plans?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || 
      plan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Assignments</CardTitle>
          <CardDescription>Loading your care assignments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!carePlans || carePlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Care Assignments</CardTitle>
          <CardDescription>Your care assignments will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No care assignments found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You haven't been assigned to any care plans yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Care Assignments</CardTitle>
        <CardDescription>
          {filteredPlans.length} care {filteredPlans.length === 1 ? "assignment" : "assignments"} found
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search assignments..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Pending Invitation</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <CareAssignmentCard
                key={plan.id}
                assignment={plan}
                className="h-auto"
              />
            ))
          ) : (
            <p className="text-center py-8 text-gray-500">No matching assignments found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
