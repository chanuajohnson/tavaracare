import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fmtUSD, type ScenarioTimeline } from '@/utils/lifecycleScenarios';
import { LifecycleTimeline } from './LifecycleTimeline';

interface Props {
  timelines: ScenarioTimeline[];
  showWeek5Adjust: boolean;
}

const ACCENTS: Array<'primary' | 'amber' | 'emerald'> = ['primary', 'amber', 'emerald'];

export const ScenarioComparisonGrid: React.FC<Props> = ({ timelines, showWeek5Adjust }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {timelines.map((t, idx) => {
        const accent = ACCENTS[idx % ACCENTS.length];
        const week5Note = t.events.find(e => e.weekIndex === 5)?.note;
        return (
          <Card key={t.scenario.key} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t.scenario.label}</CardTitle>
                <Badge variant={idx === 1 ? 'default' : 'secondary'}>
                  {fmtUSD(t.weeklyRecurring)}/wk
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{t.scenario.description}</p>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted/50 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Day 0</div>
                  <div className="text-sm font-bold">{fmtUSD(t.day0Total)}</div>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Avg / mo</div>
                  <div className="text-sm font-bold">{fmtUSD(t.monthlyAverage)}</div>
                </div>
                <div className="rounded-md bg-primary/10 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Quarter</div>
                  <div className="text-sm font-bold text-primary">{fmtUSD(t.quarterTotal)}</div>
                </div>
              </div>
              <LifecycleTimeline timeline={t} accentClass={accent} />
              {showWeek5Adjust && week5Note && (
                <div className="rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs">
                  <span className="font-medium text-amber-900 dark:text-amber-200">Wk 5 event:</span>{' '}
                  <span className="text-amber-800 dark:text-amber-300">{week5Note}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
