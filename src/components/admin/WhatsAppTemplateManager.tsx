
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Edit, Trash2, MessageSquare, Send, Search, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { SendNudgeModal } from './SendNudgeModal';

interface WhatsAppTemplate {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  stage: string;
  created_at: string;
  updated_at: string;
}

const STAGE_ORDER = [
  'registration',
  'screening',
  'onboarding',
  'post_onboarding',
  'billing',
  'ready_to_commence',
  'manual',
];

const STAGE_LABELS: Record<string, string> = {
  registration: '📝 Registration',
  screening: '🔍 Screening',
  onboarding: '📋 Onboarding',
  post_onboarding: '✅ Post-Onboarding',
  billing: '💰 Billing & Payments',
  ready_to_commence: '🚀 Ready to Commence',
  manual: '✉️ Manual',
};

const ROLE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'professional', label: 'Professional' },
  { value: 'family', label: 'Family' },
  { value: 'community', label: 'Community' },
];

export const WhatsAppTemplateManager = () => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [sendNudgeModalOpen, setSendNudgeModalOpen] = useState(false);
  const [selectedTemplateForSending, setSelectedTemplateForSending] = useState<WhatsAppTemplate | null>(null);

  const [activeRole, setActiveRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all',
    stage: 'manual',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('nudge_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTemplates = (data || []).map(item => ({
        id: item.id,
        title: item.name,
        message: item.message_template,
        target_audience: item.role,
        stage: item.stage || 'manual',
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setTemplates(mappedTemplates);

      // Open all sections by default
      const sections: Record<string, boolean> = {};
      mappedTemplates.forEach(t => {
        const key = `${t.target_audience}-${t.stage}`;
        sections[key] = true;
      });
      setOpenSections(sections);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter and group templates
  const groupedTemplates = useMemo(() => {
    let filtered = templates;

    if (activeRole !== 'all') {
      filtered = filtered.filter(t => t.target_audience === activeRole);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => t.title.toLowerCase().includes(q) || t.message.toLowerCase().includes(q)
      );
    }

    // Group by role, then by stage
    const roleOrder = activeRole === 'all'
      ? ['professional', 'family', 'community', 'all']
      : [activeRole];

    const groups: { role: string; stages: { stage: string; templates: WhatsAppTemplate[] }[] }[] = [];

    for (const role of roleOrder) {
      const roleTemplates = filtered.filter(t => t.target_audience === role);
      if (roleTemplates.length === 0) continue;

      const stageMap = new Map<string, WhatsAppTemplate[]>();
      for (const t of roleTemplates) {
        const s = t.stage || 'manual';
        if (!stageMap.has(s)) stageMap.set(s, []);
        stageMap.get(s)!.push(t);
      }

      const sortedStages = [...stageMap.entries()].sort((a, b) => {
        const ai = STAGE_ORDER.indexOf(a[0]);
        const bi = STAGE_ORDER.indexOf(b[0]);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });

      groups.push({
        role,
        stages: sortedStages.map(([stage, tmpls]) => ({ stage, templates: tmpls })),
      });
    }

    return groups;
  }, [templates, activeRole, searchQuery]);

  const totalFiltered = groupedTemplates.reduce(
    (sum, g) => sum + g.stages.reduce((s2, st) => s2 + st.templates.length, 0), 0
  );

  const handleCreate = async () => {
    try {
      const dbData = {
        name: formData.title,
        message_template: formData.message,
        role: formData.target_audience,
        message_type: 'admin_template_nudge',
        stage: formData.stage,
      };

      const { error } = await supabase.from('nudge_templates').insert([dbData]);
      if (error) throw error;

      toast.success('Template created successfully');
      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;
    try {
      const dbData = {
        name: formData.title,
        message_template: formData.message,
        role: formData.target_audience,
        stage: formData.stage,
      };

      const { error } = await supabase
        .from('nudge_templates')
        .update(dbData)
        .eq('id', editingTemplate.id);
      if (error) throw error;

      toast.success('Template updated successfully');
      setDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      const { error } = await supabase
        .from('nudge_templates')
        .delete()
        .eq('id', templateToDelete);
      if (error) throw error;

      toast.success('Template deleted successfully');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', message: '', target_audience: 'all', stage: 'manual' });
  };

  const openEditDialog = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      message: template.message,
      target_audience: template.target_audience,
      stage: template.stage,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleSendNudge = (template: WhatsAppTemplate) => {
    setSelectedTemplateForSending(template);
    setSendNudgeModalOpen(true);
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'family': return 'bg-green-100 text-green-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'professional': return '👩‍⚕️ Professional';
      case 'family': return '👨‍👩‍👧 Family';
      case 'community': return '🤝 Community';
      default: return '🌐 All Users';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp Message Templates</h2>
          <p className="text-muted-foreground">Create and manage message templates for user engagement</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search + Role Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {ROLE_TABS.map(tab => (
            <Button
              key={tab.value}
              variant={activeRole === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveRole(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {totalFiltered} template{totalFiltered !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Grouped templates */}
      {groupedTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search or filter.'
                : 'Create your first WhatsApp message template to start engaging users.'}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedTemplates.map(group => (
            <div key={group.role} className="space-y-3">
              {/* Role header (only show when viewing "all") */}
              {activeRole === 'all' && (
                <div className="flex items-center gap-2 border-b pb-2">
                  <h3 className="text-lg font-semibold">{getRoleLabel(group.role)}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {group.stages.reduce((s, st) => s + st.templates.length, 0)} templates
                  </Badge>
                </div>
              )}

              {/* Stage sections */}
              {group.stages.map(stageGroup => {
                const sectionKey = `${group.role}-${stageGroup.stage}`;
                const isOpen = openSections[sectionKey] !== false;

                return (
                  <Collapsible
                    key={sectionKey}
                    open={isOpen}
                    onOpenChange={() => toggleSection(sectionKey)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">
                          {STAGE_LABELS[stageGroup.stage] || `📌 ${stageGroup.stage}`}
                        </span>
                        <Badge variant="outline" className="text-xs ml-1">
                          {stageGroup.templates.length}
                        </Badge>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-6 pt-2">
                        {stageGroup.templates.map(template => (
                          <Card key={template.id} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base leading-tight">{template.title}</CardTitle>
                                <Badge className={`text-xs shrink-0 ${getRoleBadgeColor(template.target_audience)}`}>
                                  {template.target_audience === 'all'
                                    ? 'All'
                                    : template.target_audience.charAt(0).toUpperCase() + template.target_audience.slice(1)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="bg-muted p-3 rounded-lg min-h-[60px] max-h-[120px] overflow-y-auto">
                                <p className="text-sm whitespace-pre-line">{template.message}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleSendNudge(template)}
                                  className="flex-1"
                                  size="sm"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Nudge
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(template)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setTemplateToDelete(template.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Template Creation/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Template title"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Role</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={value => setFormData(prev => ({ ...prev, target_audience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={value => setFormData(prev => ({ ...prev, stage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="post_onboarding">Post-Onboarding</SelectItem>
                    <SelectItem value="ready_to_commence">Ready to Commence</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Your WhatsApp message template..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingTemplate ? handleUpdate : handleCreate}>
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Nudge Modal */}
      {selectedTemplateForSending && (
        <SendNudgeModal
          open={sendNudgeModalOpen}
          onOpenChange={setSendNudgeModalOpen}
          template={selectedTemplateForSending}
        />
      )}
    </div>
  );
};
