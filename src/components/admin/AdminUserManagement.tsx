
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Search, Filter, Shield, Grid3X3, List, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { RoleBasedUserGrid } from './RoleBasedUserGrid';
import { UserWithProgress } from '@/types/adminTypes';
import { useAdminProfiles } from '@/hooks/useAdminProfiles';

interface Profile {
  id: string;
  role: string;
  full_name?: string;
  created_at: string;
  last_login_at?: string;
  phone_number?: string;
  email?: string;
  available_for_matching?: boolean;
}

interface UserWithProfile {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  profile?: Profile;
}

export const AdminUserManagement = () => {
  const { profiles, loading, error, refetch } = useAdminProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Transform admin profiles to UserWithProgress format for the grid
  const transformedUsers: UserWithProgress[] = profiles.map(profile => ({
    id: profile.id,
    email: profile.email || 'No email',
    full_name: profile.full_name || 'Unnamed User',
    role: profile.role as 'family' | 'professional' | 'community' | 'admin',
    email_verified: true, // Assume verified for existing users
    last_login_at: profile.updated_at || profile.created_at,
    created_at: profile.created_at,
    phone_number: profile.phone_number,
    location: profile.location,
    professional_type: profile.professional_type,
    years_of_experience: profile.years_of_experience,
    care_types: profile.care_types || [],
    specialized_care: profile.specialized_care || [],
    available_for_matching: profile.available_for_matching
  }));

  // Also create users array in old format for compatibility
  const users: UserWithProfile[] = profiles.map(profile => ({
    id: profile.id,
    email: profile.email || 'No email',
    created_at: profile.created_at,
    last_sign_in_at: profile.updated_at,
    profile: {
      id: profile.id,
      role: profile.role,
      full_name: profile.full_name,
      created_at: profile.created_at,
      last_login_at: profile.updated_at,
      phone_number: profile.phone_number,
      email: profile.email,
      available_for_matching: profile.available_for_matching
    }
  }));

  const handleDeleteUser = async (userId: string, userProfile?: Profile) => {
    const userName = userProfile?.full_name || 'this user';
    const userRole = userProfile?.role || 'unknown';
    
    // Enhanced confirmation dialog with user details
    const confirmMessage = `Are you sure you want to permanently delete ${userName} (${userRole})?\n\nThis action cannot be undone and will remove all associated data.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(userId);

    try {
      console.log(`Attempting to delete user ${userId} (${userName})`);
      
      // Use the admin-users Edge Function for complete deletion
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'delete-user',
          user_id: userId
        }
      });

      console.log('Delete user response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      // Check if the response indicates success
      if (data?.ok === true) {
        toast.success(`Successfully deleted ${userName}`);
        console.log(`User ${userName} (${userId}) deleted successfully`);
        
        // Refresh the user list
        refetch();
      } else {
        const errorMessage = data?.error || 'Unknown error occurred';
        console.error('Delete operation failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      // Handle specific error messages
      const errorMessage = error.message || error.toString() || 'Unknown error';
      
      if (errorMessage.includes('Forbidden') || errorMessage.includes('admin only')) {
        toast.error('You do not have permission to delete users');
      } else if (errorMessage.includes('User not found')) {
        toast.error('User not found or already deleted');
        // Still refresh the list in case the user was already deleted
        refetch();
      } else if (errorMessage.includes('supabaseKey is required')) {
        toast.error('Admin configuration error. Please check SERVICE_ROLE_KEY is configured.');
      } else {
        toast.error(`Failed to delete user: ${errorMessage}`);
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle role filter clicks from statistics cards
  const handleRoleFilterClick = (role: string) => {
    const newFilter = roleFilter === role ? 'all' : role;
    setRoleFilter(newFilter);
    setSelectedUsers([]); // Clear selection when filtering
    console.log('Role filter updated to:', newFilter);
  };

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

  // Calculate role statistics
  const roleStats = {
    total: profiles.length,
    admin: profiles.filter(p => p.role === 'admin').length,
    professional: profiles.filter(p => p.role === 'professional').length,
    family: profiles.filter(p => p.role === 'family').length,
    community: profiles.filter(p => p.role === 'community').length
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
          <Button onClick={refetch} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Clickable Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            onClick={() => handleRoleFilterClick('all')}
          >
            <CardContent className="text-center p-3 bg-gray-50 rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gray-600" />
                <div className="text-2xl font-bold">{roleStats.total}</div>
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
              {roleFilter === 'all' && (
                <Badge variant="outline" className="mt-1 text-xs">Active Filter</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'admin' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
            onClick={() => handleRoleFilterClick('admin')}
          >
            <CardContent className="text-center p-3 bg-red-50 rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{roleStats.admin}</div>
              </div>
              <div className="text-sm text-gray-600">Admins</div>
              {roleFilter === 'admin' && (
                <Badge variant="outline" className="mt-1 text-xs">Active Filter</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'professional' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            onClick={() => handleRoleFilterClick('professional')}
          >
            <CardContent className="text-center p-3 bg-blue-50 rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{roleStats.professional}</div>
              </div>
              <div className="text-sm text-gray-600">Professionals</div>
              {roleFilter === 'professional' && (
                <Badge variant="outline" className="mt-1 text-xs">Active Filter</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'family' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            onClick={() => handleRoleFilterClick('family')}
          >
            <CardContent className="text-center p-3 bg-green-50 rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{roleStats.family}</div>
              </div>
              <div className="text-sm text-gray-600">Families</div>
              {roleFilter === 'family' && (
                <Badge variant="outline" className="mt-1 text-xs">Active Filter</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Filter Indicator */}
        {roleFilter !== 'all' && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Filtering by: <strong className="capitalize">{roleFilter}</strong>
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setRoleFilter('all')}
              className="ml-auto text-blue-600 hover:text-blue-700"
            >
              Clear Filter
            </Button>
          </div>
        )}

        {/* Users Display - Grid or Table view */}
        {viewMode === 'grid' ? (
          <RoleBasedUserGrid
            users={filteredTransformedUsers}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onRefresh={refetch}
            onDeleteUser={(userId, user) => handleDeleteUser(userId, {
              id: user.id,
              role: user.role,
              full_name: user.full_name,
              created_at: user.created_at,
              phone_number: user.phone_number,
              email: user.email,
              available_for_matching: user.available_for_matching
            })}
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
                        onClick={() => handleDeleteUser(user.id, user.profile)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={user.profile?.role === 'admin' || deleteLoading === user.id}
                        title={user.profile?.role === 'admin' ? 'Cannot delete admin users' : `Delete ${user.profile?.full_name || 'user'}`}
                      >
                        {deleteLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
