
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
import type { UserWithProgress, RoleStats } from "@/types/adminTypes";
import type { UserRole } from "@/types/userRoles";

export function AdminUserJourneyDashboard() {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'all' | UserRole>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<'all' | string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showNudgeSystem, setShowNudgeSystem] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserWithProgress | null>(null);
  const [roleStats, setRoleStats] = useState<Record<string, RoleStats>>({});

  const fetchUsersWithProgress = async () => {
    try {
      setLoading(true);

      // First, get all profiles with their data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get real emails from auth.users using the service role (admin only)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
      }

      // Get journey progress data
      const { data: journeyProgress, error: journeyError } = await supabase
        .from('user_journey_progress')
        .select('*');

      if (journeyError) {
        console.error('Error fetching journey progress:', journeyError);
      }

      // Combine the data
      const usersWithProgress: UserWithProgress[] = (profiles || []).map(profile => {
        // Find real email from auth users
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.id);
        const realEmail = authUser?.email || profile.id; // fallback to ID if email not found

        // Find journey progress
        const userJourneyProgress = journeyProgress?.find(jp => jp.user_id === profile.id);

        return {
          id: profile.id,
          email: realEmail,
          full_name: profile.full_name || 'Unnamed User',
          role: profile.role as UserRole,
          email_verified: authUser?.email_confirmed_at ? true : false,
          last_login_at: profile.last_login_at || profile.created_at,
          created_at: profile.created_at,
          avatar_url: profile.avatar_url,
          journey_progress: userJourneyProgress,
          onboarding_progress: profile.onboarding_progress,
          location: profile.location,
          phone_number: profile.phone_number,
          professional_type: profile.professional_type,
          years_of_experience: profile.years_of_experience,
          care_types: profile.care_types,
          specialized_care: profile.specialized_care,
        };
      });

      setUsers(usersWithProgress);
      calculateRoleStats(usersWithProgress);
    } catch (error) {
      console.error('Error in fetchUsersWithProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithProgress();
  }, []);

  const calculateRoleStats = (userData: UserWithProgress[]) => {
    const stats: Record<string, RoleStats> = {};
    
    (['family', 'professional', 'community', 'admin'] as UserRole[]).forEach(role => {
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
        {(['all', 'family', 'professional', 'community', 'admin'] as const).map(role => (
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

      {/* Users Grid - Always in grid format with proper layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map(user => (
          <UserJourneyCard
            key={user.id}
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
            onClick={() => setSelectedUserForModal(user)}
          />
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
