
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface EngagementTrendData {
  date: string;
  count: number;
}

interface EngagementTrendsChartProps {
  data: EngagementTrendData[];
}

export const EngagementTrendsChart: React.FC<EngagementTrendsChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Engagement Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Engagements",
              color: "#8884d8",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
