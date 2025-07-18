import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { BulkActionPanel } from './BulkActionPanel';
import { RoleBasedUserGrid } from './RoleBasedUserGrid';
import { UserWithProgress, RoleStats } from '@/types/adminTypes';
import { Search, Users, TrendingUp, UserCheck, Clock } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  [key: string]: any;
}

export function AdminUserJourneyDashboard() {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProgress[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [roleStats, setRoleStats] = useState<Record<string, RoleStats>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Query only columns that exist in the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          created_at,
          updated_at,
          avatar_url,
          location,
          phone_number,
          professional_type,
          years_of_experience,
          care_types,
          specialized_care
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Get auth users data to get email addresses
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Continue without email data if auth query fails
      }

      // Create a map of user emails from auth data
      const emailMap = new Map<string, string>();
      if (authData?.users) {
        (authData.users as AuthUser[]).forEach((user: AuthUser) => {
          if (user.id && user.email) {
            emailMap.set(user.id, user.email);
          }
        });
      }

      // Transform the data to match our interface
      const transformedUsers: UserWithProgress[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: emailMap.get(profile.id) || 'No email available',
        full_name: profile.full_name || 'Unknown User',
        role: profile.role || 'family',
        email_verified: false, // Default since we don't have this in profiles
        last_login_at: profile.updated_at || profile.created_at,
        created_at: profile.created_at,
        avatar_url: profile.avatar_url,
        location: profile.location,
        phone_number: profile.phone_number,
        professional_type: profile.professional_type,
        years_of_experience: profile.years_of_experience,
        care_types: profile.care_types,
        specialized_care: profile.specialized_care
      }));

      setUsers(transformedUsers);
      calculateRoleStats(transformedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoleStats = (userData: UserWithProgress[]) => {
    const stats: Record<string, RoleStats> = {};
    
    ['family', 'professional', 'community', 'admin'].forEach(role => {
      const roleUsers = userData.filter(user => user.role === role);
      stats[role] = {
        total: roleUsers.length,
        verified: roleUsers.filter(user => user.email_verified).length,
        active: roleUsers.filter(user => {
          const lastLogin = new Date(user.last_login_at);
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLogin <= 7;
        }).length,
        stalled: roleUsers.filter(user => {
          const created = new Date(user.created_at);
          const daysSinceCreated = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          const lastLogin = new Date(user.last_login_at);
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreated > 7 && daysSinceLogin > 7;
        }).length
      };
    });
    
    setRoleStats(stats);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    const allSelected = selectedUsers.length === filteredUsers.length && filteredUsers.length > 0;
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Enhanced role filter click handler with debugging
  const handleRoleFilterClick = (role: string, event?: React.MouseEvent) => {
    console.log('Role filter clicked:', { role, currentFilter: roleFilter, event });
    
    // Prevent any event propagation issues
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Toggle logic: if clicking the same role, clear filter; otherwise set the new role
    const newFilter = roleFilter === role ? 'all' : role;
    console.log('Setting role filter to:', newFilter);
    
    setRoleFilter(newFilter);
    setSelectedUsers([]); // Clear selection when filtering
    
    // Debug log the filter change
    console.log('Role filter updated from', roleFilter, 'to', newFilter);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Statistics - Enhanced clickable cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(roleStats).map(([role, stats]) => (
          <Card 
            key={role} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] select-none ${
              roleFilter === role 
                ? 'ring-2 ring-primary bg-primary/5 shadow-md' 
                : 'hover:shadow-md'
            }`}
            onClick={(event) => handleRoleFilterClick(role, event)}
            style={{ userSelect: 'none' }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between pointer-events-none">
                <div className="pointer-events-none">
                  <p className="text-sm font-medium text-muted-foreground capitalize pointer-events-none">
                    {role}
                  </p>
                  <p className="text-2xl font-bold pointer-events-none">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground pointer-events-none" />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs pointer-events-none">
                <div className="text-green-600 pointer-events-none">
                  <UserCheck className="h-3 w-3 inline mr-1 pointer-events-none" />
                  <span className="pointer-events-none">{stats.verified}</span>
                </div>
                <div className="text-blue-600 pointer-events-none">
                  <TrendingUp className="h-3 w-3 inline mr-1 pointer-events-none" />
                  <span className="pointer-events-none">{stats.active}</span>
                </div>
                <div className="text-amber-600 pointer-events-none">
                  <Clock className="h-3 w-3 inline mr-1 pointer-events-none" />
                  <span className="pointer-events-none">{stats.stalled}</span>
                </div>
              </div>
              {roleFilter === role && (
                <div className="mt-2 text-xs text-primary font-medium pointer-events-none">
                  Click to clear filter
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions Panel */}
      {selectedUsers.length > 0 && (
        <BulkActionPanel
          selectedUsers={selectedUsers}
          users={filteredUsers}
          onClearSelection={() => setSelectedUsers([])}
          onRefresh={fetchUsers}
        />
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Journey Management
            {roleFilter !== 'all' && (
              <Badge variant="outline" className="ml-2">
                Filtered by: {roleFilter}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  console.log('Dropdown filter change:', e.target.value);
                  setRoleFilter(e.target.value);
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="family">Family</option>
                <option value="professional">Professional</option>
                <option value="community">Community</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={filteredUsers.length === 0}
              >
                {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </Button>
              {roleFilter !== 'all' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Clear filter button clicked');
                    handleRoleFilterClick('all');
                  }}
                  className="flex items-center gap-2"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Role-Based User Grid */}
          <RoleBasedUserGrid
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onRefresh={fetchUsers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
