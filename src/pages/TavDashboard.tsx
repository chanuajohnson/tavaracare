import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MessageCircle, Users, TrendingUp, Clock, Mail, Building, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoSession {
  id: string;
  demo_type: string;
  session_token: string;
  messages_sent: number;
  form_interactions: number;
  demo_duration_seconds: number;
  lead_captured: boolean;
  email_captured?: string;
  company_name?: string;
  use_case_selected?: string;
  conversion_stage: string;
  created_at: string;
}

interface Lead {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  use_case: string;
  lead_score: number;
  qualification_status: string;
  created_at: string;
}

interface PlanInfo {
  plan_name: string;
  plan_type: string;
  price_monthly?: number;
  features: string[];
  limits: any;
}

export default function TavDashboard() {
  const [demoSessions, setDemoSessions] = useState<DemoSession[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch demo sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('tav_demo_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;
      setDemoSessions(sessions || []);

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('tav_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('tav_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (plansError) throw plansError;
      setPlans((plansData || []).map(plan => ({
        plan_name: plan.plan_name,
        plan_type: plan.plan_type,
        price_monthly: plan.price_monthly || undefined,
        features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : [],
        limits: plan.limits
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalSessions = demoSessions.length;
  const totalLeads = leads.length;
  const conversionRate = totalSessions > 0 ? (totalLeads / totalSessions * 100) : 0;
  const avgSessionDuration = demoSessions.reduce((acc, session) => acc + session.demo_duration_seconds, 0) / totalSessions || 0;

  // Chart data
  const dailySessionsData = demoSessions.reduce((acc, session) => {
    const date = new Date(session.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailySessionsData).map(([date, sessions]) => ({
    date,
    sessions,
    leads: leads.filter(lead => lead.created_at.split('T')[0] === date).length
  })).slice(-7);

  const useCaseData = demoSessions.reduce((acc, session) => {
    const useCase = session.use_case_selected || 'Unknown';
    acc[useCase] = (acc[useCase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(useCaseData).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TAV Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor your chatbot performance and lead generation</p>
          </div>
          <Badge variant="secondary" className="text-blue-600 bg-blue-50">
            <Crown className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Demo Sessions',
              value: totalSessions.toLocaleString(),
              icon: MessageCircle,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              title: 'Leads Generated',
              value: totalLeads.toLocaleString(),
              icon: Users,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              title: 'Conversion Rate',
              value: `${conversionRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              title: 'Avg Session Duration',
              value: `${Math.round(avgSessionDuration / 60)}m`,
              icon: Clock,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                  <CardDescription>Sessions and leads over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Use Cases Distribution</CardTitle>
                  <CardDescription>What users are trying TAV for</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest prospects who tried TAV</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 10).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{lead.full_name || lead.email}</p>
                          <p className="text-sm text-gray-600">{lead.company_name}</p>
                          <p className="text-xs text-gray-500">Use case: {lead.use_case}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={lead.qualification_status === 'qualified' ? 'default' : 'secondary'}
                        >
                          {lead.qualification_status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Score: {lead.lead_score}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demo Sessions</CardTitle>
                <CardDescription>Recent user interactions with TAV</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.demo_type} demo</p>
                          <p className="text-sm text-gray-600">
                            {session.messages_sent} messages, {session.form_interactions} interactions
                          </p>
                          <p className="text-xs text-gray-500">
                            Duration: {Math.round(session.demo_duration_seconds / 60)}m
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.lead_captured ? 'default' : 'secondary'}>
                          {session.conversion_stage}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <Card key={plan.plan_name} className={index === 1 ? 'border-blue-500 shadow-lg' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                      {index === 1 && <Badge>Popular</Badge>}
                    </div>
                    <div className="space-y-2">
                      {plan.price_monthly ? (
                        <p className="text-3xl font-bold">
                          ${plan.price_monthly}
                          <span className="text-sm font-normal text-gray-600">/mo</span>
                        </p>
                      ) : (
                        <p className="text-lg font-medium text-gray-600">Custom Pricing</p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-4" 
                      variant={index === 1 ? 'default' : 'outline'}
                    >
                      {plan.plan_type === 'demo' ? 'Try Demo' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}