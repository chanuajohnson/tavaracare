
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Calendar, Users, Activity, CheckCircle2, Clock, Circle } from 'lucide-react';
import { UserMatchingActions } from './UserMatchingActions';
import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import { useSpecificUserProfessionalProgress } from '@/hooks/useSpecificUserProfessionalProgress';
import { useUserSpecificProgress } from '@/hooks/useUserSpecificProgress';
import type { UserRole } from '@/types/userRoles';

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
  const [loading, setLoading] = useState(false);

  // Use the same journey progress hooks as MiniJourneyProgress
  const familyProgress = useSharedFamilyJourneyData(user?.role === 'family' ? user.id : '');
  const professionalProgress = useSpecificUserProfessionalProgress(user?.role === 'professional' ? user.id : '');
  const otherProgress = useUserSpecificProgress(
    user?.role !== 'family' && user?.role !== 'professional' ? user.id : '', 
    user?.role as UserRole
  );

  // Choose the appropriate progress data based on user role
  const journeyProgress = user?.role === 'family' 
    ? familyProgress 
    : user?.role === 'professional'
    ? {
        loading: professionalProgress.loading,
        completionPercentage: professionalProgress.completionPercentage,
        nextStep: professionalProgress.nextStep,
        steps: professionalProgress.steps
      }
    : otherProgress;

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
          .maybeSingle();

        if (needsError && needsError.code !== 'PGRST116') {
          console.error('Error fetching care needs:', needsError);
        } else {
          setCareNeeds(needs);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (journeyProgress.completionPercentage >= 100) return 'text-green-600';
    if (journeyProgress.completionPercentage >= 50) return 'text-blue-600';
    if (journeyProgress.completionPercentage > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (journeyProgress.completionPercentage >= 100) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (journeyProgress.completionPercentage >= 50) return <Clock className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-yellow-600" />;
  };

  const getProgressLabel = () => {
    if (journeyProgress.completionPercentage >= 100) return "Journey Complete";
    if (journeyProgress.nextStep) return journeyProgress.nextStep.title;
    return "Getting Started";
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
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.phone_number || 'No phone provided'}</span>
                    </div>
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
                {journeyProgress.loading ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Loading progress...</div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Progress */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon()}
                          <div>
                            <h3 className={`font-medium ${getStatusColor()}`}>
                              {getProgressLabel()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {journeyProgress.steps.filter(s => s.completed).length} of {journeyProgress.steps.length} steps completed
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {journeyProgress.completionPercentage}%
                        </Badge>
                      </div>
                      <Progress value={journeyProgress.completionPercentage} className="h-3" />
                    </div>

                    {/* Step Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Journey Steps</h4>
                      <div className="space-y-2">
                        {journeyProgress.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className="flex-shrink-0">
                              {step.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : step.accessible ? (
                                <Circle className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-medium ${step.completed ? 'text-green-800' : step.accessible ? 'text-gray-900' : 'text-gray-500'}`}>
                                {step.title}
                              </h5>
                              <p className="text-sm text-gray-600">{step.description}</p>
                              {step.optional && (
                                <Badge variant="outline" className="mt-1 text-xs">Optional</Badge>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <Badge variant={step.completed ? 'default' : step.accessible ? 'secondary' : 'outline'}>
                                {step.completed ? 'Complete' : step.accessible ? 'Available' : 'Locked'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Step Recommendation */}
                    {journeyProgress.nextStep && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Next Recommended Step</h4>
                              <p className="text-sm text-blue-800 mt-1">
                                {journeyProgress.nextStep.title}
                              </p>
                              <p className="text-sm text-blue-700 mt-1">
                                {journeyProgress.nextStep.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
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
