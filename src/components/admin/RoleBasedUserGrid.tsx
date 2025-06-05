
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MiniJourneyProgress } from './MiniJourneyProgress';
import { UserWithProgress } from '@/types/adminTypes';
import { Users, User, Building, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoleBasedUserGridProps {
  users: UserWithProgress[];
  selectedUsers: string[];
  onUserSelect: (userId: string, checked: boolean) => void;
}

export function RoleBasedUserGrid({ users, selectedUsers, onUserSelect }: RoleBasedUserGridProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'family': return <Users className="h-5 w-5 text-blue-600" />;
      case 'professional': return <User className="h-5 w-5 text-green-600" />;
      case 'community': return <Building className="h-5 w-5 text-amber-600" />;
      case 'admin': return <Shield className="h-5 w-5 text-purple-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'family': return 'border-blue-200 bg-blue-50';
      case 'professional': return 'border-green-200 bg-green-50';
      case 'community': return 'border-amber-200 bg-amber-50';
      case 'admin': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const roleGroups = {
    family: users.filter(user => user.role === 'family'),
    professional: users.filter(user => user.role === 'professional'),
    community: users.filter(user => user.role === 'community'),
    admin: users.filter(user => user.role === 'admin')
  };

  const renderUserCard = (user: UserWithProgress) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selectedUsers.includes(user.id)}
          onCheckedChange={(checked) => onUserSelect(user.id, checked as boolean)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {user.full_name || 'Unnamed User'}
            </h4>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {user.location && (
              <p className="text-xs text-gray-400 truncate">{user.location}</p>
            )}
          </div>
          
          <MiniJourneyProgress 
            userId={user.id} 
            userRole={user.role as any}
          />
        </div>
      </div>
    </motion.div>
  );

  const renderRoleCard = (role: keyof typeof roleGroups, title: string) => {
    const roleUsers = roleGroups[role];
    
    if (roleUsers.length === 0) return null;

    return (
      <Card key={role} className={`${getRoleColor(role)} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg capitalize">
            {getRoleIcon(role)}
            {title}
            <Badge variant="outline" className="ml-auto">
              {roleUsers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {roleUsers.map(renderUserCard)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderRoleCard('family', 'Family Members')}
      {renderRoleCard('professional', 'Professionals')}
      {renderRoleCard('community', 'Community Members')}
      {renderRoleCard('admin', 'Administrators')}
      
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
