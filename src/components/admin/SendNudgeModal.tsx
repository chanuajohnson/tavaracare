
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Send, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { UserRole } from '@/utils/supabaseTypes';

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
}

interface SendNudgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    title: string;
    message: string;
    target_audience: string;
  };
}

export const SendNudgeModal = ({ open, onOpenChange, template }: SendNudgeModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users when modal opens
  React.useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, template.target_audience]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, phone_number, role')
        .not('phone_number', 'is', null);

      // Filter by target audience with proper type casting
      if (template.target_audience && template.target_audience !== 'all') {
        query = query.eq('role', template.target_audience as UserRole);
      }

      const { data, error } = await query;
      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSendNudge = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setSending(true);
    try {
      // Follow the same pattern as the existing WhatsApp nudge system
      const { data, error } = await supabase.functions.invoke('send-nudge-whatsapp', {
        body: {
          userIds: selectedUsers,
          message: template.message,
          templateId: template.id,
          message_type: 'admin_template_nudge'
        }
      });

      if (error) throw error;

      toast.success(`Nudge sent to ${selectedUsers.length} users successfully!`);
      onOpenChange(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending nudge:', error);
      toast.error('Failed to send nudge');
    } finally {
      setSending(false);
    }
  };

  const selectedCount = selectedUsers.length;
  const totalCount = users.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Nudge: {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Preview */}
          <div className="bg-muted p-4 rounded-lg">
            <Label className="text-sm font-medium">Message Preview:</Label>
            <p className="text-sm mt-1">{template.message}</p>
          </div>

          {/* User Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Select Recipients {totalCount > 0 && `(${selectedCount}/${totalCount})`}
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {template.target_audience === 'all' ? 'All Users' : 
                   template.target_audience === 'professional' ? 'Professionals' :
                   template.target_audience === 'family' ? 'Families' : 'Community'}
                </Badge>
                {totalCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found with phone numbers for this audience
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={user.id}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{user.full_name || 'Unnamed User'}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {user.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {user.phone_number}
                              </span>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendNudge}
            disabled={selectedCount === 0 || sending}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedCount} User{selectedCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
