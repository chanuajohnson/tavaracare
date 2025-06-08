
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Search, Filter, Shield, Grid3X3, List } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { RoleBasedUserGrid } from './RoleBasedUserGrid';
import { UserWithProgress } from '@/types/adminTypes';

interface Profile {
  id: string;
  role: string;
  full_name?: string;
  created_at: string;
  last_login_at?: string;
  phone_number?: string;
  email?: string;
}

interface UserWithProfile {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  profile?: Profile;
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Transform users to UserWithProgress format for the grid
  const transformedUsers: UserWithProgress[] = users.map(user => {
    // Get email from either user object or profile, with fallback
    const userEmail = user.email || user.profile?.email || 'No email';
    
    return {
      id: user.id,
      email: userEmail,
      full_name: user.profile?.full_name || 'Unnamed User',
      role: (user.profile?.role || 'family') as 'family' | 'professional' | 'community' | 'admin',
      email_verified: true, // Assume verified for existing users
      last_login_at: user.last_sign_in_at || user.profile?.last_login_at || user.created_at,
      created_at: user.created_at,
      phone_number: user.profile?.phone_number,
      location: undefined, // Add if available in your data
      professional_type: undefined, // Add if available in your data
      years_of_experience: undefined, // Add if available in your data
      care_types: [], // Add if available in your data
      specialized_care: [] // Add if available in your data
    };
  });

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched successfully:', profilesData?.length || 0);
      const safeProfiles = Array.isArray(profilesData) ? profilesData : [];
      setProfiles(safeProfiles);
      
      // Convert profiles to users format for display
      const profileUsers: UserWithProfile[] = safeProfiles.map(profile => ({
        id: profile.id,
        email: 'Profile data only', // Fallback for profile-only data
        created_at: profile.created_at || new Date().toISOString(),
        last_sign_in_at: profile.last_login_at,
        profile
      }));

      setUsers(profileUsers);
      return safeProfiles;
    } catch (error: any) {
      console.error('Error in fetchProfiles:', error);
      throw error;
    }
  };

  const enhanceWithAuthData = async (profiles: Profile[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, skipping auth enhancement');
        return;
      }

      console.log('Attempting to enhance with auth data...');
      const response = await fetch(`https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/admin-users?action=list-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Auth enhancement failed, continuing with profile data only');
        return;
      }

      const responseData = await response.json();
      const authUsers = Array.isArray(responseData.users) ? responseData.users : [];
      
      console.log('Auth users fetched:', authUsers.length);

      // Only enhance if we actually got auth users data
      if (authUsers.length > 0) {
        // Merge auth data with profiles
        const enhancedUsers = authUsers.map((authUser: any) => {
          const profile = profiles.find(p => p.id === authUser.id);
          return {
            ...authUser,
            profile
          };
        });

        setUsers(enhancedUsers);
        toast.success(`Enhanced with auth data: ${enhancedUsers.length} users`);
      } else {
        console.log('No auth users returned, keeping profile data');
        toast.info(`Using profile data: ${profiles.length} users`);
      }
    } catch (error: any) {
      console.error('Auth enhancement failed:', error);
      toast.info(`Using profile data: ${profiles.length} users`);
      // Don't throw error, just continue with profile data
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, always fetch profiles as our primary data source
      const profiles = await fetchProfiles();
      
      // Then try to enhance with auth data if possible
      // This will only replace users if auth data is successfully retrieved
      await enhanceWithAuthData(profiles);
      
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast.error(`Failed to load users: ${error.message}`);
      
      // Ensure we always have some data to display
      if (users.length === 0) {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/admin-users?action=delete-user&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Safe filtering logic
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || roleFilter === 'all' || user.profile?.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Filter transformed users for grid view
  const filteredTransformedUsers = transformedUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'family': return 'bg-green-100 text-green-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
            Error: {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={fetchUsers} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-2xl font-bold text-red-600">
              {profiles.filter(p => p.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Admins</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {profiles.filter(p => p.role === 'professional').length}
            </div>
            <div className="text-sm text-gray-600">Professionals</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {profiles.filter(p => p.role === 'family').length}
            </div>
            <div className="text-sm text-gray-600">Families</div>
          </div>
        </div>

        {/* Users Display - Grid or Table view */}
        {viewMode === 'grid' ? (
          <RoleBasedUserGrid
            users={filteredTransformedUsers}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onRefresh={fetchUsers}
          />
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.profile?.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email || 'No email'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.profile?.role || 'unknown')}>
                        {user.profile?.role || 'No role'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={user.profile?.role === 'admin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {users.length === 0 ? 'No users found.' : 'No users match your search criteria.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
