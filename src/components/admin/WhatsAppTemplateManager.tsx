import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, Edit3, Trash2, Eye, Search, Filter, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface WhatsAppTemplate {
  id: string;
  name: string;
  role: 'family' | 'professional' | 'community';
  stage: string;
  message_template: string;
  message_type: 'whatsapp' | 'email' | 'both';
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  name: string;
  role: 'family' | 'professional' | 'community';
  stage: string;
  message_template: string;
  message_type: 'whatsapp' | 'email' | 'both';
}

// Filter out any empty strings and ensure all stages are valid
const TEMPLATE_STAGES = [
  'welcome',
  'step_1',
  'step_2', 
  'step_3',
  'step_4',
  'step_5',
  'step_6',
  'stalled',
  'financial_proposal',
  'custom'
].filter(stage => stage && stage.trim() !== '');

const SAMPLE_USER_DATA = {
  family: {
    full_name: 'Sarah Johnson',
    role: 'family',
    completion_percentage: 65,
    current_step: 4,
    next_step: 'Schedule Visit'
  },
  professional: {
    full_name: 'Marcus Williams',
    role: 'professional', 
    completion_percentage: 80,
    current_step: 4,
    next_step: 'Complete Background Check'
  },
  community: {
    full_name: 'Elena Rodriguez',
    role: 'community',
    completion_percentage: 50,
    current_step: 2,
    next_step: 'Set Availability'
  }
};

// Professional templates for each stage
const PROFESSIONAL_TEMPLATES = {
  welcome: `Hi [Name]! 👋 Welcome to Tavara Care! I'm Chan, and I'm thrilled you've joined our professional caregiver community. 

Your expertise and compassion are exactly what families in our community need. You're starting an amazing journey that will make a real difference in people's lives! 💙

Let's get your professional profile set up so you can start connecting with families who need your specific skills. Ready to begin? 🚀

Any questions? Just reply! I'm here to help every step of the way.`,

  step_1: `Hi [Name]! 💙 This is Chan from Tavara Care. 

I hope you're settling in well! I noticed you're [X]% through your professional setup. Your next step is: [NextStep]

Building a strong professional profile is key to connecting with the right families. The more complete your profile, the better we can match you with opportunities that fit your skills and schedule perfectly! 

Need any help getting this step done? I'm here to support you! 🤝`,

  step_2: `Hi [Name]! 🌟 Chan here from Tavara Care.

Great progress on your professional journey! You're [X]% complete. Your experience and background make you exactly the kind of caregiver families are looking for.

Your next step: [NextStep] - this helps families understand your expertise and builds trust right from the start.

The families in our community are amazing, and I can't wait for them to see what you bring to caregiving! 

Any questions about this step? Just reply! 💪`,

  step_3: `Hi [Name]! 📋 Chan from Tavara Care here.

You're doing fantastic! [X]% complete on your professional setup. I can see you're serious about providing excellent care - that's exactly what makes Tavara special.

Next up: [NextStep] - this step helps families feel confident and secure choosing you as their caregiver. It's all about building that trust!

Once this is complete, you'll be so much closer to receiving your first family matches. Exciting! 

Need help with documentation or have questions? I'm here! 🤝`,

  step_4: `Hi [Name]! ⏰ Chan here from Tavara Care.

You're [X]% through your professional journey - almost there! Families are going to love working with someone as dedicated as you.

Your next step: [NextStep] - this helps us match you with families whose schedules align perfectly with yours. No more guessing or awkward scheduling conversations!

Professional caregivers like you who complete their full profiles get 3x more quality matches. You're so close! 

Questions about availability settings? Just reply! 💙`,

  step_5: `Hi [Name]! 🎓 Chan from Tavara Care.

Amazing progress! You're [X]% complete and really showing your commitment to professional excellence. 

Your next step: [NextStep] - these certifications and training modules set you apart and show families you're continuously growing your expertise.

The families we work with specifically look for caregivers who invest in their professional development. You're exactly what they're hoping to find!

Ready to complete this step? I'm here if you need support! 🌟`,

  step_6: `Hi [Name]! 🎉 Chan from Tavara Care.

WOW! You're [X]% complete - you're officially ready to start receiving family assignments! 

Your dedication to completing your professional profile shows exactly the kind of caregiver you are. Families are going to feel so grateful to have you on their care team.

Keep an eye out for your first family matches - they're coming soon! In the meantime, feel free to explore your professional dashboard.

Welcome to the Tavara family of professional caregivers! 💙`,

  stalled: `Hi [Name]! 🤝 Chan from Tavara Care.

I wanted to check in - you made excellent progress on your professional setup ([X]% complete!), but I noticed it's been a while since your last update.

I know life gets busy, especially for someone dedicated to caregiving like you. Is there anything I can help you with to get back on track?

Families are actively looking for professionals with your background. Don't let this opportunity slip away - you're so close to being fully set up!

What's the biggest challenge right now? Just reply and let me know how I can help! 💪`,

  financial_proposal: `Hi [Name]! 💼 Chan from Tavara Care.

Exciting news! I have information about our professional caregiver compensation and benefit packages ready for you.

This includes:
• Competitive hourly rates
• Flexible scheduling options  
• Professional development opportunities
• Support and community

As a qualified professional caregiver, you deserve to understand exactly how our partnership will benefit you financially and professionally.

When would be a good time to discuss this? I can walk you through everything! 💙`
};

export function WhatsAppTemplateManager() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: '',
    role: 'family',
    stage: 'welcome',
    message_template: '',
    message_type: 'whatsapp'
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nudge_templates')
        .select('*')
        .order('role', { ascending: true })
        .order('stage', { ascending: true });

      if (error) throw error;
      
      // Filter out any templates with empty or invalid data
      const validTemplates = (data || [])
        .filter(item => 
          item.id && 
          item.name && 
          item.role && 
          item.stage && 
          item.message_template &&
          item.message_type &&
          item.name.trim() !== '' &&
          item.role.trim() !== '' &&
          item.stage.trim() !== '' &&
          item.message_template.trim() !== '' &&
          item.message_type.trim() !== ''
        )
        .map(item => ({
          id: item.id,
          name: item.name,
          role: item.role as 'family' | 'professional' | 'community',
          stage: item.stage,
          message_template: item.message_template,
          message_type: item.message_type as 'whatsapp' | 'email' | 'both',
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
      
      setTemplates(validTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const generatePreviewMessage = (template: WhatsAppTemplate, userRole: 'family' | 'professional' | 'community') => {
    const sampleUser = SAMPLE_USER_DATA[userRole];
    let message = template.message_template;
    
    // Replace placeholders with sample data
    message = message.replace(/\[Name\]/g, sampleUser.full_name);
    message = message.replace(/\[Role\]/g, sampleUser.role);
    message = message.replace(/\[X\]/g, sampleUser.completion_percentage.toString());
    message = message.replace(/\[StepTitle\]/g, sampleUser.next_step);
    message = message.replace(/\[NextStep\]/g, sampleUser.next_step);
    message = message.replace(/\[CurrentStep\]/g, sampleUser.current_step.toString());
    
    return message;
  };

  const createProfessionalTemplates = async () => {
    try {
      const professionalTemplates = Object.entries(PROFESSIONAL_TEMPLATES).map(([stage, message]) => ({
        name: `Professional ${stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        role: 'professional' as const,
        stage,
        message_template: message,
        message_type: 'whatsapp' as const
      }));

      for (const template of professionalTemplates) {
        // Check if template already exists
        const { data: existing } = await supabase
          .from('nudge_templates')
          .select('id')
          .eq('role', template.role)
          .eq('stage', template.stage)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('nudge_templates')
            .insert(template);

          if (error) {
            console.error(`Error creating ${template.stage} template:`, error);
          }
        }
      }

      toast.success(`Created professional templates for all stages!`);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error creating professional templates:', error);
      toast.error('Failed to create professional templates');
    }
  };

  const saveTemplate = async () => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('nudge_templates')
          .update({
            name: templateForm.name,
            role: templateForm.role,
            stage: templateForm.stage,
            message_template: templateForm.message_template,
            message_type: templateForm.message_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('nudge_templates')
          .insert({
            name: templateForm.name,
            role: templateForm.role,
            stage: templateForm.stage,
            message_template: templateForm.message_template,
            message_type: templateForm.message_type
          });

        if (error) throw error;
        toast.success('Template created successfully');
      }

      setShowTemplateDialog(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('nudge_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      role: 'family',
      stage: 'welcome',
      message_template: '',
      message_type: 'whatsapp'
    });
  };

  const openEditDialog = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      role: template.role,
      stage: template.stage,
      message_template: template.message_template,
      message_type: template.message_type
    });
    setShowTemplateDialog(true);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    resetForm();
    setShowTemplateDialog(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.message_template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || template.role === filterRole;
    const matchesStage = filterStage === 'all' || template.stage === filterStage;
    
    return matchesSearch && matchesRole && matchesStage;
  });

  // Get unique stages from templates, filtering out empty values
  const availableStages = Array.from(
    new Set([...TEMPLATE_STAGES, ...templates.map(t => t.stage)])
  ).filter(stage => stage && stage.trim() !== '');

  const getDefaultTemplate = (stage: string, role: string): string => {
    if (role === 'professional' && PROFESSIONAL_TEMPLATES[stage as keyof typeof PROFESSIONAL_TEMPLATES]) {
      return PROFESSIONAL_TEMPLATES[stage as keyof typeof PROFESSIONAL_TEMPLATES];
    }
    
    const templates = {
      welcome: `Hi [Name]! 👋 Welcome to Tavara Care! I'm Chan, and I'm excited to help you on your ${role} journey. You're [X]% complete - let's get you connected with the right care solutions! Need help? Just reply! 💙`,
      step_1: `Hi [Name]! 💙 This is Chan from Tavara Care. I noticed you're on step [CurrentStep] of your ${role} journey: [StepTitle]. Your next step is: [NextStep]. Need any assistance? We're here to help!`,
      stalled: `Hi [Name]! 🤝 This is Chan from Tavara Care. I wanted to check in - you've made great progress on your ${role} journey ([X]% complete), but I noticed it's been a while since your last update. Need any help getting to the next step? I'm here for you!`,
      financial_proposal: `Hi [Name]! 💼 This is Chan from Tavara Care. We have your personalized care plan and financial proposal ready! This includes all payment options and subscription details tailored to your needs. When would be a good time to discuss? 💙`
    };
    
    return templates[stage as keyof typeof templates] || `Hi [Name]! This is Chan from Tavara Care. Hope you're doing well on your ${role} journey! 💙`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Template Manager</h2>
          <p className="text-gray-600">Create and manage contextual WhatsApp message templates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={createProfessionalTemplates} 
            variant="outline"
            className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Sparkles className="h-4 w-4" />
            Create All Professional Templates
          </Button>
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Templates</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Role</label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Stage</label>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {availableStages.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No templates found</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={createProfessionalTemplates} variant="outline">
                Create Professional Templates
              </Button>
              <Button onClick={openCreateDialog}>
                Create Custom Template
              </Button>
            </div>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {template.role}
                      </Badge>
                      <Badge variant="secondary">
                        {template.stage.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.message_template}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Created: {new Date(template.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Create contextual WhatsApp templates with Chan's magical personality
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  placeholder="e.g., Family Welcome Message"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">User Role</label>
                <Select 
                  value={templateForm.role} 
                  onValueChange={(value: 'family' | 'professional' | 'community') => setTemplateForm(prev => ({...prev, role: value}))}
                >
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Journey Stage</label>
                <Select 
                  value={templateForm.stage} 
                  onValueChange={(value) => {
                    setTemplateForm(prev => ({
                      ...prev, 
                      stage: value,
                      message_template: prev.message_template || getDefaultTemplate(value, prev.role)
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_STAGES.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Type</label>
                <Select 
                  value={templateForm.message_type} 
                  onValueChange={(value: 'whatsapp' | 'email' | 'both') => setTemplateForm(prev => ({...prev, message_type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="both">Both WhatsApp & Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message Template</label>
              <Textarea
                placeholder="Hi [Name]! 👋 This is Chan from Tavara Care..."
                value={templateForm.message_template}
                onChange={(e) => setTemplateForm(prev => ({...prev, message_template: e.target.value}))}
                rows={6}
                className="resize-none"
              />
              <div className="text-xs text-gray-500">
                Available placeholders: [Name], [Role], [X] (percentage), [CurrentStep], [NextStep], [StepTitle]
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveTemplate} disabled={!templateForm.name || !templateForm.message_template}>
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              See how this template looks with sample user data
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <Tabs defaultValue="family" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="family">Family</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>
              
              {(['family', 'professional', 'community'] as const).map(role => (
                <TabsContent key={role} value={role} className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        WhatsApp Preview - {role.charAt(0).toUpperCase() + role.slice(1)} Role
                      </span>
                    </div>
                    <p className="text-sm text-green-700 whitespace-pre-wrap">
                      {generatePreviewMessage(previewTemplate, role)}
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
