import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Calendar, Users, Activity } from 'lucide-react';
import { UserMatchingActions } from './UserMatchingActions';

interface UserDetailModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdate
}) => {
  const [careNeeds, setCareNeeds] = useState<any>(null);
  const [journeyProgress, setJourneyProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserDetails();
    }
  }, [user, isOpen]);

  const fetchUserDetails = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch care needs for family users
      if (user.role === 'family') {
        const { data: needs, error: needsError } = await supabase
          .from('care_needs_family')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (needsError && needsError.code !== 'PGRST116') {
          console.error('Error fetching care needs:', needsError);
        } else {
          setCareNeeds(needs);
        }
      }

      // Fetch journey progress
      const { data: progress, error: progressError } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching journey progress:', progressError);
      } else {
        setJourneyProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.full_name || 'User Details'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="journey">Journey</TabsTrigger>
            {user.role === 'family' && (
              <TabsTrigger value="matching">Matching</TabsTrigger>
            )}
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            {/* Basic Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Profile Information</span>
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'professional' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{user.phone_number}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{user.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {user.last_login_at && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          Last active {new Date(user.last_login_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Care Needs for Family Users */}
            {user.role === 'family' && careNeeds && (
              <Card>
                <CardHeader>
                  <CardTitle>Care Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Care Recipient</h4>
                      <p className="text-sm text-gray-600">
                        {careNeeds.care_recipient_name || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Primary Contact</h4>
                      <p className="text-sm text-gray-600">
                        {careNeeds.primary_contact_name || 'Not specified'}
                      </p>
                      {careNeeds.primary_contact_phone && (
                        <p className="text-sm text-gray-600">
                          {careNeeds.primary_contact_phone}
                        </p>
                      )}
                    </div>
                    {careNeeds.preferred_time_start && careNeeds.preferred_time_end && (
                      <div>
                        <h4 className="font-medium mb-2">Preferred Time</h4>
                        <p className="text-sm text-gray-600">
                          {careNeeds.preferred_time_start} - {careNeeds.preferred_time_end}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="journey" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Journey Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {journeyProgress ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Step</span>
                      <Badge variant="outline">
                        {journeyProgress.current_step}/{journeyProgress.total_steps}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${journeyProgress.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {journeyProgress.completion_percentage}% complete
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">No journey data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'family' && (
            <TabsContent value="matching" className="space-y-4">
              <UserMatchingActions user={user} onUserUpdate={onUserUpdate} />
            </TabsContent>
          )}

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Activity tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
