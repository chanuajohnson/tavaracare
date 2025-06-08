
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Edit, Plus, Save, X, BarChart } from 'lucide-react';

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: string;
  user_role: string;
  is_optional: boolean;
  tooltip_content: string;
  detailed_explanation: string;
  time_estimate_minutes: number;
  link_path: string;
  icon_name: string;
  is_active: boolean;
  order_index: number;
}

export const JourneyStepManager = () => {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    step_number: 0,
    title: '',
    description: '',
    category: 'foundation',
    user_role: 'family',
    is_optional: false,
    tooltip_content: '',
    detailed_explanation: '',
    time_estimate_minutes: 10,
    link_path: '',
    icon_name: 'Circle',
    is_active: true,
    order_index: 0
  });

  useEffect(() => {
    fetchSteps();
    fetchAnalytics();
  }, []);

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('journey_steps')
        .select('*')
        .order('user_role, order_index');

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error fetching journey steps:', error);
      toast.error('Failed to load journey steps');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('journey_analytics')
        .select(`
          journey_step_id,
          action_type,
          count(*) as action_count,
          journey_steps(title, step_number)
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSave = async (stepId?: string) => {
    try {
      if (stepId) {
        // Update existing step
        const { error } = await supabase
          .from('journey_steps')
          .update(formData)
          .eq('id', stepId);

        if (error) throw error;
        toast.success('Step updated successfully');
      } else {
        // Create new step
        const { error } = await supabase
          .from('journey_steps')
          .insert(formData);

        if (error) throw error;
        toast.success('Step created successfully');
        setShowAddForm(false);
      }

      setEditingStep(null);
      resetForm();
      fetchSteps();
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step');
    }
  };

  const handleEdit = (step: JourneyStep) => {
    setFormData({
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      category: step.category,
      user_role: step.user_role,
      is_optional: step.is_optional,
      tooltip_content: step.tooltip_content,
      detailed_explanation: step.detailed_explanation,
      time_estimate_minutes: step.time_estimate_minutes,
      link_path: step.link_path,
      icon_name: step.icon_name,
      is_active: step.is_active,
      order_index: step.order_index
    });
    setEditingStep(step.id);
  };

  const resetForm = () => {
    setFormData({
      step_number: 0,
      title: '',
      description: '',
      category: 'foundation',
      user_role: 'family',
      is_optional: false,
      tooltip_content: '',
      detailed_explanation: '',
      time_estimate_minutes: 10,
      link_path: '',
      icon_name: 'Circle',
      is_active: true,
      order_index: 0
    });
  };

  const groupedSteps = steps.reduce((acc, step) => {
    if (!acc[step.user_role]) acc[step.user_role] = [];
    acc[step.user_role].push(step);
    return acc;
  }, {} as Record<string, JourneyStep[]>);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading journey steps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Journey Step Manager</h2>
          <p className="text-gray-600">Manage and customize user journey steps</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Step Analytics (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.filter(a => a.action_type === 'viewed').length}
              </div>
              <div className="text-sm text-blue-700">Total Views</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.filter(a => a.action_type === 'completed').length}
              </div>
              <div className="text-sm text-green-700">Completions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.filter(a => a.action_type === 'tooltip_viewed').length}
              </div>
              <div className="text-sm text-purple-700">Tooltip Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(showAddForm || editingStep) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingStep ? 'Edit Journey Step' : 'Add New Journey Step'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="step_number">Step Number</Label>
                <Input
                  id="step_number"
                  type="number"
                  value={formData.step_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, step_number: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="order_index">Order Index</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="scheduling">Scheduling</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="user_role">User Role</Label>
                <Select value={formData.user_role} onValueChange={(value) => setFormData(prev => ({ ...prev, user_role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time_estimate">Time Estimate (minutes)</Label>
                <Input
                  id="time_estimate"
                  type="number"
                  value={formData.time_estimate_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_estimate_minutes: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tooltip_content">Tooltip Content</Label>
              <Textarea
                id="tooltip_content"
                value={formData.tooltip_content}
                onChange={(e) => setFormData(prev => ({ ...prev, tooltip_content: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="detailed_explanation">Detailed Explanation</Label>
              <Textarea
                id="detailed_explanation"
                value={formData.detailed_explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, detailed_explanation: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_path">Link Path</Label>
                <Input
                  id="link_path"
                  value={formData.link_path}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_path: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="icon_name">Icon Name</Label>
                <Input
                  id="icon_name"
                  value={formData.icon_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_optional"
                  checked={formData.is_optional}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_optional: checked }))}
                />
                <Label htmlFor="is_optional">Optional Step</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleSave(editingStep || undefined)}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingStep(null);
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps by User Role */}
      {Object.entries(groupedSteps).map(([role, roleSteps]) => (
        <Card key={role}>
          <CardHeader>
            <CardTitle className="capitalize">{role} Journey Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">#{step.step_number}</span>
                      <span className="font-medium">{step.title}</span>
                      {step.is_optional && (
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      )}
                      {!step.is_active && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                      <Badge className="text-xs capitalize">{step.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Est. time: {step.time_estimate_minutes} min | Icon: {step.icon_name}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(step)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
