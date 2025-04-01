
import { useState, useEffect } from "react";
import { supabase, deleteUserWithCleanup } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletionDetails, setDeletionDetails] = useState<{isOpen: boolean, message: string}>({
    isOpen: false,
    message: ""
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Check if Supabase is available
      if (!supabase) {
        console.error('Supabase client is not initialized');
        toast.error('Supabase client is not initialized');
        return;
      }

      // Create query with error handling
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process the data to handle both first_name/last_name and full_name fields
      const processedProfiles = profiles?.map(profile => ({
        ...profile,
        // If first_name exists, use it; otherwise fall back to full_name
        display_name: (profile.first_name && profile.last_name) 
          ? `${profile.first_name} ${profile.last_name}`
          : profile.full_name || 'Unknown User'
      })) || [];

      setUsers(processedProfiles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      setIsLoadingSubscriptions(true);
      
      // Check if Supabase is available
      if (!supabase) {
        console.error('Supabase client is not initialized');
        toast.error('Supabase client is not initialized');
        return;
      }
      
      // Updated query that doesn't rely on the problematic join
      const { data, error } = await supabase
        .from('cta_engagement_tracking')
        .select('*, user_id')
        .or('action_type.eq.subscription_plan_selected,action_type.eq.subscription_completed')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // If we get data, fetch the profile information separately for each user_id
      if (data && data.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(data.map(item => item.user_id))];
        
        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, role')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles for subscriptions:', profilesError);
          // Continue with what we have
        }
        
        // Create a map of user_id to profile data
        const profilesMap = (profiles || []).reduce((acc, profile) => {
          acc[profile.id] = {
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            full_name: profile.full_name || '',
            role: profile.role
          };
          return acc;
        }, {});
        
        // Combine the data
        const enrichedData = data.map(item => ({
          ...item,
          profiles: profilesMap[item.user_id] || { 
            first_name: 'Unknown', 
            last_name: 'User',
            full_name: 'Unknown User',
            role: 'unknown'
          }
        }));
        
        setSubscriptions(enrichedData);
      } else {
        setSubscriptions([]);
      }
    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      toast.error('Error fetching subscription data: ' + error.message);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoadingDelete(userId);
      setDeleteError(null);
      setDeletionDetails({ isOpen: false, message: "" });
      
      // Use the enhanced deleteUserWithCleanup function
      const { success, error, details } = await deleteUserWithCleanup(userId);
      
      if (!success) {
        // If we have detailed information about tables that were cleaned up, show it
        if (details && details.length > 0) {
          setDeletionDetails({
            isOpen: true,
            message: `Partial cleanup completed for: ${details.join(', ')}. Final error: ${error || 'Unknown error'}`
          });
        }
        throw new Error(error || 'Unknown error during user deletion');
      }

      toast.success('User deleted successfully');
      // Remove the deleted user from the local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error: any) {
      console.error('Full delete user error:', error);
      setDeleteError(error.message);
      toast.error('Error deleting user: ' + error.message);
    } finally {
      setIsLoadingDelete(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSubscriptionData();
  }, []); // Empty dependency array means this only runs once when component mounts

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <Button onClick={fetchUsers} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : "Refresh"}
            </Button>
          </div>

          {deleteError && (
            <div className="bg-destructive/15 p-4 rounded-md mb-4 border border-destructive/30">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive">Error deleting user</h3>
                  <p className="text-sm text-destructive/90 mt-1">{deleteError}</p>
                  
                  {deletionDetails.isOpen && (
                    <Collapsible 
                      open={deletionDetails.isOpen} 
                      className="mt-2 border border-destructive/20 rounded-md p-2"
                    >
                      <CollapsibleContent>
                        <p className="text-sm text-destructive/80">
                          {deletionDetails.message}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  <p className="text-sm text-destructive/80 mt-2">
                    Note: If deletion fails through this interface, you may need to manually delete
                    records in the database that reference this user before trying again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.display_name}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isLoadingDelete === user.id || user.role === 'admin'}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        {isLoadingDelete === user.id ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Deleting...
                          </>
                        ) : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No users found. Click "Refresh" to try again.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Subscription Tracking</h2>
            <Button onClick={fetchSubscriptionData} disabled={isLoadingSubscriptions}>
              {isLoadingSubscriptions ? "Loading..." : "Refresh"}
            </Button>
          </div>
          
          <div className="bg-muted/30 border p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              This tab shows all subscription-related events from users. In the production version, 
              this would be connected to a payment processor and would show real subscription status.
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {sub.profiles?.first_name && sub.profiles?.last_name 
                        ? `${sub.profiles.first_name} ${sub.profiles.last_name}`
                        : sub.profiles?.full_name || 'Unknown User'}
                      <div className="text-xs text-muted-foreground">{sub.profiles?.role}</div>
                    </TableCell>
                    <TableCell>
                      {sub.action_type === 'subscription_plan_selected' ? 'Selected Plan' : 
                       sub.action_type === 'subscription_completed' ? 'Completed Subscription' : 
                       sub.action_type}
                    </TableCell>
                    <TableCell>
                      {sub.additional_data?.plan_name || 'Unknown Plan'}
                    </TableCell>
                    <TableCell>
                      {sub.additional_data?.feature_accessed || 'General Access'}
                    </TableCell>
                    <TableCell>
                      {new Date(sub.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {subscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No subscription data available. When users upgrade their plans, events will appear here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
