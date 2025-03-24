
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";

export function FeatureInterestTracker() {
  const [featureData, setFeatureData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchFeatureInterestData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get feature interest data from our tracking table
        const { data, error } = await supabase
          .from('feature_interest_tracking')
          .select('*')
          .order('clicked_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error("Error fetching feature interest data:", error);
          return;
        }
        
        setFeatureData(data || []);
      } catch (err) {
        console.error("Failed to fetch feature interest data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeatureInterestData();
    
    // Set up a real-time subscription for updates
    const subscription = supabase
      .channel('feature_interest_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'feature_interest_tracking' 
      }, (payload) => {
        setFeatureData(prev => [payload.new, ...prev].slice(0, 10));
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  // Also track user events if Zapier is being used
  useEffect(() => {
    if (!user) return;
    
    const logAdminEvent = async () => {
      try {
        await supabase.from('user_events').insert([{
          user_id: user.id,
          event_type: 'admin_dashboard_view',
          additional_data: {
            component: 'FeatureInterestTracker',
            timestamp: new Date().toISOString()
          }
        }]);
      } catch (err) {
        console.error("Failed to log admin dashboard view:", err);
      }
    };
    
    logAdminEvent();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Interest Tracking</CardTitle>
        <CardDescription>
          Monitor which features users are most interested in based on engagement data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-400">Loading data...</div>
          </div>
        ) : featureData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feature interest data available yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.feature_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.action_type || 'click'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.user_email || 'Anonymous'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(item.clicked_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
