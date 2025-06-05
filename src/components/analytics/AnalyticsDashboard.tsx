
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunnelAnalytics } from './FunnelAnalytics';
import { SentimentDashboard } from './SentimentDashboard';
import { CustomerHealthDashboard } from './CustomerHealthDashboard';
import { BarChart, Heart, Users, TrendingUp } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Comprehensive insights into user behavior and satisfaction
        </div>
      </div>

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Funnel Analysis
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Sentiment Analysis
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Health
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="mt-6">
          <FunnelAnalytics />
        </TabsContent>

        <TabsContent value="sentiment" className="mt-6">
          <SentimentDashboard />
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <CustomerHealthDashboard />
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Funnel Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Track user progression through key flows
                      </p>
                    </div>
                    <BarChart className="h-8 w-8 text-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Sentiment Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor user feedback and satisfaction
                      </p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Customer Health</h4>
                      <p className="text-sm text-muted-foreground">
                        Identify at-risk customers and opportunities
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Journey Tracking</span>
                    <span className="text-green-600 font-bold">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sentiment Analysis</span>
                    <span className="text-green-600 font-bold">Auto-enabled</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Health Scoring</span>
                    <span className="text-green-600 font-bold">Real-time</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Retention</span>
                    <span className="text-blue-600 font-bold">90 days</span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-800">Enhanced Features</h5>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Automated sentiment scoring</li>
                      <li>• Real-time customer health updates</li>
                      <li>• Advanced funnel conversion tracking</li>
                      <li>• Predictive churn analysis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
