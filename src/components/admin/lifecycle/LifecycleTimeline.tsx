import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ScenarioTimeline } from '@/utils/lifecycleScenarios';
import { fmtUSD } from '@/utils/lifecycleScenarios';

interface Props {
  timeline: ScenarioTimeline;
  /** Tailwind hsl-based color for the cumulative line */
  accentClass?: 'primary' | 'amber' | 'emerald';
}

const ACCENT_HSL: Record<string, string> = {
  primary: 'hsl(217, 75%, 55%)',
  amber: 'hsl(38, 92%, 50%)',
  emerald: 'hsl(160, 84%, 39%)',
};

export const LifecycleTimeline: React.FC<Props> = ({ timeline, accentClass = 'primary' }) => {
  const accent = ACCENT_HSL[accentClass];
  const data = timeline.events.map(e => ({
    label: e.label,
    weekIndex: e.weekIndex,
    'One-time fees': e.oneTime,
    Wages: e.wages,
    Subscription: e.subscription,
    'Add-ons': e.addons,
    Cumulative: e.cumulative,
    note: e.note,
  }));

  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={56}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: any, name: any) => [fmtUSD(Number(value)), name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            yAxisId="left"
            x="Day 0"
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="2 4"
          />
          <Bar yAxisId="left" dataKey="One-time fees" stackId="a" fill="hsl(38, 92%, 50%)" />
          <Bar yAxisId="left" dataKey="Wages" stackId="a" fill="hsl(217, 75%, 65%)" />
          <Bar yAxisId="left" dataKey="Subscription" stackId="a" fill="hsl(217, 50%, 45%)" />
          <Bar yAxisId="left" dataKey="Add-ons" stackId="a" fill="hsl(160, 60%, 50%)" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Cumulative"
            stroke={accent}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
