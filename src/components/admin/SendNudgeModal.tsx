
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MessageSquare, Users, Send, Loader2, Phone } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { UserRole } from '@/utils/supabaseTypes';
import { InlinePhoneEditor } from '@/components/care-plan/InlinePhoneEditor';

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

  const handlePhoneNumberUpdate = (userId: string, newPhoneNumber: string | null) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, phone_number: newPhoneNumber || '' }
          : user
      )
    );
  };

  const sendWhatsAppToUser = (userName: string, phoneNumber?: string | null) => {
    if (!phoneNumber) {
      toast.error(`Phone number not available for ${userName}. Please add a phone number first.`);
      return;
    }
    
    // Clean phone number (remove any non-digits except +)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(template.message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendToAllUsers = () => {
    const selectedUsersWithPhones = users.filter(user => 
      selectedUsers.includes(user.id) && user.phone_number
    );

    if (selectedUsersWithPhones.length === 0) {
      toast.error('No selected users have phone numbers available. Please add phone numbers first.');
      return;
    }

    // Open WhatsApp for each selected user with a slight delay to prevent browser blocking
    selectedUsersWithPhones.forEach((user, index) => {
      setTimeout(() => {
        sendWhatsAppToUser(user.full_name || 'User', user.phone_number);
      }, index * 500); // 500ms delay between each
    });

    toast.success(`Opening WhatsApp for ${selectedUsersWithPhones.length} users`);
  };

  const selectedCount = selectedUsers.length;
  const totalCount = users.length;
  const usersWithPhones = users.filter(user => user.phone_number);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Nudge: {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Preview */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">WhatsApp Message Preview</span>
              </div>
              <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap font-mono text-gray-700">
                {template.message}
              </div>
            </CardContent>
          </Card>

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
                      <Card key={user.id} className="border-gray-200">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={user.id}
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleUserToggle(user.id)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={user.id} className="font-medium cursor-pointer">
                                    {user.full_name || 'Unnamed User'}
                                  </Label>
                                  <Badge variant="secondary" className="text-xs">
                                    {user.role}
                                  </Badge>
                                </div>
                                <div className="mt-1">
                                  <InlinePhoneEditor
                                    userId={user.id}
                                    currentPhoneNumber={user.phone_number}
                                    userName={user.full_name || 'User'}
                                    onPhoneNumberUpdate={(newPhone) => handlePhoneNumberUpdate(user.id, newPhone)}
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => sendWhatsAppToUser(
                                user.full_name || 'User',
                                user.phone_number
                              )}
                              variant="outline"
                              size="sm"
                              className="border-green-300 text-green-700 hover:bg-green-50"
                              disabled={!user.phone_number}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send WhatsApp
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          {/* Send to All Button */}
          {usersWithPhones.length > 0 && (
            <div className="flex justify-center">
              <Button 
                onClick={sendToAllUsers}
                disabled={selectedCount === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Send WhatsApp to {selectedCount} Selected User{selectedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">📱 How this works:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Add/edit phone numbers for users using the edit buttons</li>
                  <li>• Select users you want to send the message to</li>
                  <li>• Click "Send WhatsApp" to open WhatsApp with the pre-written message</li>
                  <li>• Use "Send WhatsApp to X Selected Users" to open WhatsApp for all selected users</li>
                  <li>• Each WhatsApp window opens with a 500ms delay to prevent browser blocking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
