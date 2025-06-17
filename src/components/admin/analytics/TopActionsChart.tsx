
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface TopActionData {
  action: string;
  count: number;
}

interface TopActionsChartProps {
  data: TopActionData[];
}

export const TopActionsChart: React.FC<TopActionsChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top User Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Actions",
              color: "#82ca9d",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="action" type="category" width={100} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
