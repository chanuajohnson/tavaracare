
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, Send, Users, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface NudgeTemplate {
  id: string;
  name: string;
  stage: string;
  role: string;
  message_template: string;
  message_type: 'email' | 'whatsapp' | 'both';
}

interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community' | 'admin';
  journey_progress?: {
    current_step: number;
    total_steps: number;
    completion_percentage: number;
  };
}

interface NudgeSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers?: string[];
  users: UserWithProgress[];
  onRefresh: () => void;
}

export function NudgeSystem({ 
  open, 
  onOpenChange, 
  selectedUsers = [], 
  users, 
  onRefresh 
}: NudgeSystemProps) {
  const [templates, setTemplates] = useState<NudgeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [messageType, setMessageType] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [sending, setSending] = useState(false);

  const targetUsers = users.filter(user => selectedUsers.includes(user.id));

  useEffect(() => {
    if (open) {
      fetchNudgeTemplates();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setCustomMessage(template.message_template);
        setMessageType(template.message_type);
      }
    }
  }, [selectedTemplate, templates]);

  const fetchNudgeTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('nudge_templates')
        .select('*')
        .order('role', { ascending: true })
        .order('stage', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedTemplates: NudgeTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        stage: template.stage,
        role: template.role,
        message_template: template.message_template,
        message_type: template.message_type as 'email' | 'whatsapp' | 'both'
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error fetching nudge templates:', error);
    }
  };

  const getRelevantTemplates = () => {
    if (targetUsers.length === 0) return templates;
    
    // Get unique roles of selected users
    const roles = [...new Set(targetUsers.map(user => user.role))];
    
    // Get unique current steps
    const steps = [...new Set(targetUsers.map(user => 
      user.journey_progress?.current_step || 1
    ))];

    // Filter templates based on user roles and stages
    return templates.filter(template => {
      const matchesRole = roles.includes(template.role as any);
      const matchesStage = steps.includes(parseInt(template.stage.replace('step_', ''))) || 
                          template.stage === 'stalled';
      return matchesRole && (matchesStage || template.stage === 'stalled');
    });
  };

  const sendNudge = async () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (targetUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    setSending(true);
    try {
      // Get current user for admin_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Log the communication for each user
      const communicationPromises = targetUsers.map(targetUser => 
        supabase.from('admin_communications').insert({
          admin_id: user.id,
          target_user_id: targetUser.id,
          message_type: selectedTemplate ? 'email' : 'custom',
          template_id: selectedTemplate || null,
          custom_message: customMessage,
          delivery_status: 'pending'
        })
      );

      await Promise.all(communicationPromises);

      // Send actual nudges based on message type
      if (messageType === 'email' || messageType === 'both') {
        const { error: emailError } = await supabase.functions.invoke('send-nudge-email', {
          body: {
            userIds: selectedUsers,
            message: customMessage,
            templateId: selectedTemplate
          }
        });
        
        if (emailError) throw emailError;
      }

      if (messageType === 'whatsapp' || messageType === 'both') {
        const { error: whatsappError } = await supabase.functions.invoke('send-nudge-whatsapp', {
          body: {
            userIds: selectedUsers,
            message: customMessage,
            templateId: selectedTemplate
          }
        });
        
        if (whatsappError) throw whatsappError;
      }

      toast.success(`Nudge sent to ${targetUsers.length} user(s)`);
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      console.error('Error sending nudge:', error);
      toast.error('Failed to send nudge');
    } finally {
      setSending(false);
    }
  };

  const groupedTemplates = getRelevantTemplates().reduce((acc, template) => {
    const key = `${template.role}_${template.stage}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(template);
    return acc;
  }, {} as Record<string, NudgeTemplate[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Nudge to Users
          </DialogTitle>
          <DialogDescription>
            Send targeted messages to help users progress in their journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected users overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Selected Users ({targetUsers.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {targetUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <span>{user.full_name || 'Unnamed User'}</span>
                    <span className="text-muted-foreground">
                      (Step {user.journey_progress?.current_step || 1})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Template (Optional)</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pre-made template or write custom message" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Custom Message</SelectItem>
                {Object.entries(groupedTemplates).map(([key, templates]) => {
                  const [role, stage] = key.split('_');
                  return templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {role}
                        </Badge>
                        <span>{template.name}</span>
                        {stage === 'stalled' && (
                          <Clock className="h-3 w-3 text-orange-500" />
                        )}
                      </div>
                    </SelectItem>
                  ));
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Message type selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Delivery Method</label>
            <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Only
                  </div>
                </SelectItem>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp Only
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <MessageSquare className="h-4 w-4" />
                    Both Email & WhatsApp
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your nudge message here..."
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              Tip: Personalize your message to increase engagement
            </div>
          </div>

          <Separator />

          {/* Action buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendNudge} 
              disabled={sending || !customMessage.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : `Send to ${targetUsers.length} User(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
