
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Send, Mail, X, BarChart3 } from "lucide-react";

interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community';
  journey_progress?: {
    current_step: number;
    total_steps: number;
    completion_percentage: number;
  };
}

interface BulkActionPanelProps {
  selectedUsers: string[];
  users: UserWithProgress[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActionPanel({ 
  selectedUsers, 
  users, 
  onClearSelection, 
  onRefresh 
}: BulkActionPanelProps) {
  const targetUsers = users.filter(user => selectedUsers.includes(user.id));
  
  // Analyze selected users
  const analytics = {
    byRole: targetUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    byStage: targetUsers.reduce((acc, user) => {
      const step = user.journey_progress?.current_step || 1;
      acc[step] = (acc[step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    
    averageCompletion: targetUsers.reduce((sum, user) => 
      sum + (user.journey_progress?.completion_percentage || 0), 0
    ) / targetUsers.length || 0
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">
              {selectedUsers.length} Users Selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Bulk Nudge
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          </div>
        </div>

        {/* Quick analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">By Role</div>
            <div className="flex gap-1 mt-1">
              {Object.entries(analytics.byRole).map(([role, count]) => (
                <Badge key={role} variant="outline" className="text-xs capitalize">
                  {role}: {count}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Common Stages</div>
            <div className="flex gap-1 mt-1">
              {Object.entries(analytics.byStage)
                .sort(([a], [b]) => Number(b) - Number(a))
                .slice(0, 3)
                .map(([step, count]) => (
                  <Badge key={step} variant="outline" className="text-xs">
                    Step {step}: {count}
                  </Badge>
                ))}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Avg. Completion</div>
            <div className="text-lg font-medium mt-1">
              {Math.round(analytics.averageCompletion)}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Quick Actions</div>
            <div className="flex gap-1 mt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Sample nudge suggestions */}
        <div className="border-t pt-3">
          <div className="text-sm text-muted-foreground mb-2">
            💡 Suggested actions for this group:
          </div>
          <div className="flex gap-2 text-xs">
            {analytics.averageCompletion < 50 && (
              <Badge variant="secondary">Low completion - Send motivation nudge</Badge>
            )}
            {Object.keys(analytics.byStage).length === 1 && (
              <Badge variant="secondary">Same stage - Bulk guidance available</Badge>
            )}
            {Object.keys(analytics.byRole).length === 1 && (
              <Badge variant="secondary">Same role - Role-specific templates</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
