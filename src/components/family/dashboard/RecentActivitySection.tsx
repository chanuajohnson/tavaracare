
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const RecentActivitySection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your care plans and meal activities</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">No recent activities</p>
      </CardContent>
    </Card>
  );
};
