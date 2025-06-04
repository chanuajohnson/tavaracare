
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Send, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { UserJourneyCard } from "./UserJourneyCard";
import { NudgeSystem } from "./NudgeSystem";
import { BulkActionPanel } from "./BulkActionPanel";

interface AdminUserWithProgress {
  id: string;
  email: string;
  full_name: string;
  role: 'family' | 'professional' | 'community' | 'admin';
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
}

interface RoleStats {
  total: number;
  verified: number;
  active: number;
  stalled: number;
}

export function AdminUserJourneyDashboard() {
  const [users, setUsers] = useState<AdminUserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'all' | 'family' | 'professional' | 'community'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<'all' | string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showNudgeSystem, setShowNudgeSystem] = useState(false);
  const [roleStats, setRoleStats] = useState<Record<string, RoleStats>>({});

  useEffect(() => {
    fetchUsersWithProgress();
  }, []);

  const fetchUsersWithProgress = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email:id,
          full_name,
          role,
          email_verified,
          last_login_at,
          created_at,
          avatar_url,
          onboarding_progress
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch journey progress for each user
      const { data: progressData, error: progressError } = await supabase
        .from('user_journey_progress')
        .select('*');

      if (progressError) throw progressError;

      // Combine user data with progress and filter out admin users
      const usersWithProgress = (usersData || [])
        .filter(user => user.role !== 'admin') // Exclude admin users
        .map(user => {
          const progress = progressData?.find(p => p.user_id === user.id);
          return {
            ...user,
            email: user.id, // Temporary until we get email from auth
            journey_progress: progress || null
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

  const calculateRoleStats = (userData: AdminUserWithProgress[]) => {
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
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || 
      (user.journey_progress?.current_step.toString() === filterStage);
    
    return matchesRole && matchesSearch && matchesStage;
  });

  const groupedUsers = {
    family: filteredUsers.filter(u => u.role === 'family'),
    professional: filteredUsers.filter(u => u.role === 'professional'),
    community: filteredUsers.filter(u => u.role === 'community')
  };

  const handleBulkNudge = () => {
    setShowNudgeSystem(true);
  };

  const resendVerificationEmail = async (userId: string) => {
    try {
      // Call edge function to resend verification
      const { error } = await supabase.functions.invoke('resend-verification', {
        body: { userId }
      });
      
      if (error) throw error;
      
      // Update the verification sent timestamp
      await supabase
        .from('profiles')
        .update({ email_verification_sent_at: new Date().toISOString() })
        .eq('id', userId);
        
      fetchUsersWithProgress(); // Refresh data
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
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

      {/* Main role cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(groupedUsers).map(([role, roleUsers]) => {
          if (selectedRole !== 'all' && selectedRole !== role) return null;
          
          const stats = roleStats[role];
          
          return (
            <Card key={role} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Users className="h-5 w-5" />
                  {role} Users
                  <Badge variant="outline">{roleUsers.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {stats && (
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">{stats.verified}</div>
                        <div className="text-xs text-muted-foreground">Verified</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-blue-600">{stats.active}</div>
                        <div className="text-xs text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-orange-600">{stats.stalled}</div>
                        <div className="text-xs text-muted-foreground">Stalled</div>
                      </div>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {roleUsers.length > 0 ? (
                  roleUsers.map(user => (
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
                    />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No {role} users found
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
}
