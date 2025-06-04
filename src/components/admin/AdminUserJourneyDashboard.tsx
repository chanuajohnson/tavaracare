
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Send, BarChart3, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { UserJourneyCard } from "./UserJourneyCard";
import { NudgeSystem } from "./NudgeSystem";
import { BulkActionPanel } from "./BulkActionPanel";
import { UserDetailModal } from "./UserDetailModal";

interface UserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community';
  email_verified: boolean;
  last_login_at: string;
  created_at: string;
  avatar_url?: string;
  journey_progress?: {
    current_step: number;
    total_steps: number;
    completion_percentage: number;
    last_activity_at: string;
  };
  onboarding_progress?: any;
  location?: string;
  phone_number?: string;
  professional_type?: string;
  years_of_experience?: string;
  care_types?: string[];
  specialized_care?: string[];
}

interface RoleStats {
  total: number;
  verified: number;
  active: number;
  stalled: number;
}

export function AdminUserJourneyDashboard() {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'all' | 'family' | 'professional' | 'community'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<'all' | string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showNudgeSystem, setShowNudgeSystem] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserWithProgress | null>(null);
  const [roleStats, setRoleStats] = useState<Record<string, RoleStats>>({});

  useEffect(() => {
    fetchUsersWithProgress();
  }, []);

  const fetchUsersWithProgress = async () => {
    setLoading(true);
    try {
      // First, run the sync function to ensure data is up to date
      await supabase.rpc('sync_user_journey_progress');

      // Fetch profiles with journey progress
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          email_verified,
          last_login_at,
          created_at,
          avatar_url,
          onboarding_progress,
          location,
          phone_number,
          professional_type,
          years_of_experience,
          care_types,
          specialized_care
        `)
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch journey progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_journey_progress')
        .select('*');

      if (progressError) throw progressError;

      // Fetch emails from auth.users via edge function or use a view
      const { data: authData, error: authError } = await supabase
        .from('profiles')
        .select('id')
        .neq('role', 'admin');

      // For now, we'll use user ID as email placeholder until we can get actual emails
      const usersWithProgress: UserWithProgress[] = (profilesData || []).map(profile => {
        const progress = progressData?.find(p => p.user_id === profile.id);
        return {
          ...profile,
          email: `user-${profile.id.slice(0, 8)}@placeholder.com`, // Placeholder until we get real emails
          journey_progress: progress || {
            current_step: 1,
            total_steps: profile.role === 'family' ? 7 : profile.role === 'professional' ? 5 : 3,
            completion_percentage: 0,
            last_activity_at: profile.created_at
          },
          role: profile.role as 'family' | 'professional' | 'community'
        };
      });

      setUsers(usersWithProgress);
      calculateRoleStats(usersWithProgress);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoleStats = (userData: UserWithProgress[]) => {
    const stats: Record<string, RoleStats> = {};
    
    ['family', 'professional', 'community'].forEach(role => {
      const roleUsers = userData.filter(u => u.role === role);
      const verified = roleUsers.filter(u => u.email_verified).length;
      const recentActivity = new Date();
      recentActivity.setDate(recentActivity.getDate() - 7);
      const active = roleUsers.filter(u => 
        u.journey_progress?.last_activity_at && 
        new Date(u.journey_progress.last_activity_at) > recentActivity
      ).length;
      const stalled = roleUsers.filter(u => 
        u.journey_progress?.completion_percentage && 
        u.journey_progress.completion_percentage < 100 &&
        (!u.journey_progress.last_activity_at || 
         new Date(u.journey_progress.last_activity_at) <= recentActivity)
      ).length;

      stats[role] = {
        total: roleUsers.length,
        verified,
        active,
        stalled
      };
    });

    setRoleStats(stats);
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || 
      (user.journey_progress?.current_step.toString() === filterStage);
    
    return matchesRole && matchesSearch && matchesStage;
  });

  const handleBulkNudge = () => {
    setShowNudgeSystem(true);
  };

  const resendVerificationEmail = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('resend-verification', {
        body: { userId }
      });
      
      if (error) throw error;
      
      await supabase
        .from('profiles')
        .update({ email_verification_sent_at: new Date().toISOString() })
        .eq('id', userId);
        
      fetchUsersWithProgress();
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and bulk actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Journey Management</h1>
          <p className="text-muted-foreground">Monitor user progress and send targeted nudges</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, emails, or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-60"
            />
          </div>
          
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="1">Step 1</SelectItem>
              <SelectItem value="2">Step 2</SelectItem>
              <SelectItem value="3">Step 3</SelectItem>
              <SelectItem value="4">Step 4</SelectItem>
              <SelectItem value="5">Step 5</SelectItem>
              <SelectItem value="6">Step 6</SelectItem>
              <SelectItem value="7">Step 7</SelectItem>
            </SelectContent>
          </Select>

          {selectedUsers.length > 0 && (
            <Button onClick={handleBulkNudge} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Nudge Selected ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2 border-b">
        {(['all', 'family', 'professional', 'community'] as const).map(role => (
          <Button
            key={role}
            variant={selectedRole === role ? "default" : "ghost"}
            onClick={() => setSelectedRole(role)}
            className="capitalize"
          >
            {role === 'all' ? 'All Users' : `${role} Users`}
            {role !== 'all' && roleStats[role] && (
              <Badge variant="secondary" className="ml-2">
                {roleStats[role].total}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Users Grid - Always in grid format */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map(user => (
          <div key={user.id} className="relative">
            <UserJourneyCard
              user={user}
              selected={selectedUsers.includes(user.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedUsers(prev => [...prev, user.id]);
                } else {
                  setSelectedUsers(prev => prev.filter(id => id !== user.id));
                }
              }}
              onResendVerification={() => resendVerificationEmail(user.id)}
              onRefresh={fetchUsersWithProgress}
            />
            <Button
              onClick={() => setSelectedUserForModal(user)}
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600">No Users Found</h3>
          <p className="text-gray-500 mt-2">
            No users match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}

      {/* Bulk action panel */}
      {selectedUsers.length > 0 && (
        <BulkActionPanel
          selectedUsers={selectedUsers}
          users={users}
          onClearSelection={() => setSelectedUsers([])}
          onRefresh={fetchUsersWithProgress}
        />
      )}

      {/* Nudge system dialog */}
      {showNudgeSystem && (
        <NudgeSystem
          open={showNudgeSystem}
          onOpenChange={setShowNudgeSystem}
          selectedUsers={selectedUsers.length > 0 ? selectedUsers : undefined}
          users={users}
          onRefresh={fetchUsersWithProgress}
        />
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUserForModal}
        open={!!selectedUserForModal}
        onOpenChange={(open) => !open && setSelectedUserForModal(null)}
        onRefresh={fetchUsersWithProgress}
      />
    </div>
  );
}
