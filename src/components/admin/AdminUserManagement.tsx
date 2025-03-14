
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(profiles || []);
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoadingDelete(userId);
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
      });

      if (error) {
        throw error;
      }

      toast.success('User deleted successfully');
      // Remove the deleted user from the local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    } finally {
      setIsLoadingDelete(null);
    }
  };

  // Use useEffect instead of useState for initial fetch
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this only runs once when component mounts

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <Button onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

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
                  {user.first_name} {user.last_name}
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
                    {isLoadingDelete === user.id ? "Deleting..." : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

