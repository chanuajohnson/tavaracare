import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Edit3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface WhatsAppTemplate {
  id: string;
  name: string;
  role: 'family' | 'professional' | 'community';
  stage: string;
  message_template: string;
  message_type: 'whatsapp' | 'email' | 'both';
}

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'family' | 'professional' | 'community';
  userName: string;
  userPhone: string;
  userProgress?: {
    completion_percentage?: number;
    current_step?: number;
    next_step?: { title: string };
  };
  onSendMessage: (message: string) => void;
}

export function TemplateSelector({ 
  open, 
  onOpenChange, 
  userRole, 
  userName, 
  userPhone,
  userProgress,
  onSendMessage 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, userRole]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nudge_templates')
        .select('*')
        .eq('role', userRole)
        .eq('message_type', 'whatsapp')
        .or('message_type.eq.both')
        .order('stage');

      if (error) throw error;
      
      // Type the response properly to match our interface
      const typedTemplates = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        role: item.role as 'family' | 'professional' | 'community',
        stage: item.stage,
        message_template: item.message_template,
        message_type: item.message_type as 'whatsapp' | 'email' | 'both'
      }));
      
      setTemplates(typedTemplates);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedMessage = (template: WhatsAppTemplate): string => {
    let message = template.message_template;
    
    // Replace placeholders with actual user data
    message = message.replace(/\[Name\]/g, userName);
    message = message.replace(/\[Role\]/g, userRole);
    
    if (userProgress) {
      message = message.replace(/\[X\]/g, (userProgress.completion_percentage || 0).toString());
      message = message.replace(/\[CurrentStep\]/g, (userProgress.current_step || 1).toString());
      message = message.replace(/\[NextStep\]/g, userProgress.next_step?.title || 'Continue your journey');
      message = message.replace(/\[StepTitle\]/g, userProgress.next_step?.title || 'Continue your journey');
    } else {
      message = message.replace(/\[X\]/g, '0');
      message = message.replace(/\[CurrentStep\]/g, '1');
      message = message.replace(/\[NextStep\]/g, 'Continue your journey');
      message = message.replace(/\[StepTitle\]/g, 'Continue your journey');
    }
    
    return message;
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const personalizedMessage = generatePersonalizedMessage(template);
      setCustomMessage(personalizedMessage);
    }
    setSelectedTemplate(templateId);
  };

  const handleSendMessage = () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    onSendMessage(customMessage);
    onOpenChange(false);
    setSelectedTemplate('');
    setCustomMessage('');
  };

  const getQuickTemplates = () => [
    {
      id: 'quick_welcome',
      name: 'Quick Welcome',
      message: `Hi ${userName}! 👋 Welcome to Tavara Care! I'm Chan, and I'm excited to help you on your ${userRole} journey. How can I assist you today? 💙`
    },
    {
      id: 'quick_checkin',
      name: 'Quick Check-in',
      message: `Hi ${userName}! 💙 This is Chan from Tavara Care. Just checking in to see how you're doing with your ${userRole} journey. Need any assistance? I'm here to help!`
    },
    {
      id: 'quick_support',
      name: 'Quick Support',
      message: `Hi ${userName}! 🤝 This is Chan from Tavara Care. I wanted to reach out and see if you need any support or have questions about our services. Feel free to reply anytime!`
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send WhatsApp Message to {userName}
          </DialogTitle>
          <DialogDescription>
            Choose a template or write a custom message with Chan's magical touch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Templates</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {getQuickTemplates().map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomMessage(template.message)}
                  className="text-left h-auto p-3 justify-start"
                >
                  <div>
                    <div className="font-medium text-xs">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.message.substring(0, 50)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Saved Templates for {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a saved template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.stage.replace('_', ' ')}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message Customization */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Customize Message</label>
              <Edit3 className="h-4 w-4 text-gray-400" />
            </div>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`Hi ${userName}! 👋 This is Chan from Tavara Care...`}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              Add Chan's magical personality and personalize for {userName}
            </div>
          </div>

          {/* User Context */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="text-sm">
                <div className="font-medium text-blue-800">User Context</div>
                <div className="text-blue-600 mt-1">
                  <div>Name: {userName}</div>
                  <div>Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</div>
                  <div>Phone: {userPhone}</div>
                  {userProgress && (
                    <>
                      <div>Progress: {userProgress.completion_percentage}%</div>
                      <div>Next Step: {userProgress.next_step?.title || 'Continue journey'}</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!customMessage.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send WhatsApp Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
