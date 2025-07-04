
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, MessageSquare, Send, Users } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { SendNudgeModal } from './SendNudgeModal';

interface WhatsAppTemplate {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  created_at: string;
  updated_at: string;
}

export const WhatsAppTemplateManager = () => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  // Add new state for the send nudge modal
  const [sendNudgeModalOpen, setSendNudgeModalOpen] = useState(false);
  const [selectedTemplateForSending, setSelectedTemplateForSending] = useState<WhatsAppTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Use the correct table name: nudge_templates
      const { data, error } = await supabase
        .from('nudge_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('nudge_templates')
        .insert([formData]);
      
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
      const { error } = await supabase
        .from('nudge_templates')
        .update(formData)
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
    setFormData({
      title: '',
      message: '',
      target_audience: 'all'
    });
  };

  const openEditDialog = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      message: template.message,
      target_audience: template.target_audience
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    resetForm();
    setDialogOpen(true);
  };

  // New function to handle sending nudge - following the same pattern as existing WhatsApp modals
  const handleSendNudge = (template: WhatsAppTemplate) => {
    setSelectedTemplateForSending(template);
    setSendNudgeModalOpen(true);
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'family': return 'bg-green-100 text-green-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp Message Templates</h2>
          <p className="text-muted-foreground">Create and manage message templates for user engagement</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <Badge className={getAudienceBadgeColor(template.target_audience)}>
                  {template.target_audience === 'all' ? 'All Users' : 
                   template.target_audience.charAt(0).toUpperCase() + template.target_audience.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg min-h-[80px]">
                <p className="text-sm">{template.message}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Send Nudge Button - Primary action following the same pattern as emergency WhatsApp */}
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

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">Create your first WhatsApp message template to start engaging users.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Template title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="professional">Professionals</SelectItem>
                  <SelectItem value="family">Families</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
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

      {/* Send Nudge Modal - Following the same pattern as EmergencyShiftWhatsAppModal */}
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
