
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface DailyActiveUserData {
  date: string;
  users: number;
}

interface DailyActiveUsersChartProps {
  data: DailyActiveUserData[];
}

export const DailyActiveUsersChart: React.FC<DailyActiveUsersChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Active Users</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            users: {
              label: "Active Users",
              color: "#ffc658",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="users" fill="#ffc658" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
