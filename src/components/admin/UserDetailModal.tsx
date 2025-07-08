
import React, { useState, useEffect, useRef } from 'react';
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
import { MatchingStatusToggle } from './MatchingStatusToggle';
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

  // Only call hooks when user and role are valid
  const shouldCallFamilyHook = user?.role === 'family' && user?.id;
  const shouldCallProfessionalHook = user?.role === 'professional' && user?.id;
  const shouldCallOtherHook = user?.role && user?.role !== 'family' && user?.role !== 'professional' && user?.id;

  // Use hooks conditionally with proper fallbacks
  const familyProgress = useSharedFamilyJourneyData(shouldCallFamilyHook ? user.id : '');
  const professionalProgress = useSpecificUserProfessionalProgress(shouldCallProfessionalHook ? user.id : '');
  const otherProgress = useUserSpecificProgress(
    shouldCallOtherHook ? user.id : '', 
    shouldCallOtherHook ? (user.role as UserRole) : 'family'
  );

  // Safely choose the appropriate progress data with comprehensive null checks
  const getJourneyProgress = () => {
    if (!user?.role || !user?.id) {
      return {
        loading: false,
        completionPercentage: 0,
        nextStep: null,
        steps: []
      };
    }

    if (user.role === 'family' && familyProgress) {
      return {
        loading: familyProgress.loading || false,
        completionPercentage: familyProgress.completionPercentage || 0,
        nextStep: familyProgress.nextStep || null,
        steps: Array.isArray(familyProgress.steps) ? familyProgress.steps : []
      };
    }

    if (user.role === 'professional' && professionalProgress) {
      return {
        loading: professionalProgress.loading || false,
        completionPercentage: professionalProgress.completionPercentage || 0,
        nextStep: professionalProgress.nextStep || null,
        steps: Array.isArray(professionalProgress.steps) ? professionalProgress.steps : []
      };
    }

    if (otherProgress) {
      return {
        loading: otherProgress.loading || false,
        completionPercentage: otherProgress.completionPercentage || 0,
        nextStep: otherProgress.nextStep || null,
        steps: Array.isArray(otherProgress.steps) ? otherProgress.steps : []
      };
    }

    // Fallback for any case
    return {
      loading: false,
      completionPercentage: 0,
      nextStep: null,
      steps: []
    };
  };

  const journeyProgress = getJourneyProgress();

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
    const percentage = journeyProgress?.completionPercentage || 0;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    const percentage = journeyProgress?.completionPercentage || 0;
    if (percentage >= 100) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (percentage >= 50) return <Clock className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-yellow-600" />;
  };

  const getProgressLabel = () => {
    const percentage = journeyProgress?.completionPercentage || 0;
    if (percentage >= 100) return "Journey Complete";
    if (journeyProgress?.nextStep?.title) return journeyProgress.nextStep.title;
    return "Getting Started";
  };

  if (!user) return null;

  // Safely access steps with comprehensive null checks
  const steps = Array.isArray(journeyProgress?.steps) ? journeyProgress.steps : [];
  const completionPercentage = journeyProgress?.completionPercentage || 0;
  const nextStep = journeyProgress?.nextStep || null;
  const isProgressLoading = journeyProgress?.loading || false;

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

            {/* Matching Status for Professional Users */}
            {user.role === 'professional' && (
              <MatchingStatusToggle
                userId={user.id}
                currentStatus={user.available_for_matching ?? true}
                userFullName={user.full_name || 'Unknown User'}
                onStatusChange={onUserUpdate}
              />
            )}
          </TabsContent>

          <TabsContent value="journey" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Journey Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {isProgressLoading ? (
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
                              {steps.filter(s => s?.completed).length} of {steps.length} steps completed
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {completionPercentage}%
                        </Badge>
                      </div>
                      <Progress value={completionPercentage} className="h-3" />
                    </div>

                    {/* Step Details with comprehensive null checks */}
                    {steps.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Journey Steps</h4>
                        <div className="space-y-2">
                          {steps.map((step, index) => {
                            // Safely access step properties with fallbacks
                            const stepId = step?.id || step?.step_number || index;
                            const stepTitle = step?.title || 'Untitled Step';
                            const stepDescription = step?.description || 'No description available';
                            const isCompleted = Boolean(step?.completed);
                            const isAccessible = step?.accessible !== false; // Default to true if not specified
                            const isOptional = Boolean(step?.optional || step?.is_optional);

                            return (
                              <div key={stepId} className="flex items-center gap-3 p-3 rounded-lg border">
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  ) : isAccessible ? (
                                    <Circle className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className={`font-medium ${isCompleted ? 'text-green-800' : isAccessible ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {stepTitle}
                                  </h5>
                                  <p className="text-sm text-gray-600">{stepDescription}</p>
                                  {isOptional && (
                                    <Badge variant="outline" className="mt-1 text-xs">Optional</Badge>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  <Badge variant={isCompleted ? 'default' : isAccessible ? 'secondary' : 'outline'}>
                                    {isCompleted ? 'Complete' : isAccessible ? 'Available' : 'Locked'}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No journey progress data available for this user.</p>
                      </div>
                    )}

                    {/* Next Step Recommendation with null checks */}
                    {nextStep && nextStep.title && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Next Recommended Step</h4>
                              <p className="text-sm text-blue-800 mt-1">
                                {nextStep.title}
                              </p>
                              {nextStep.description && (
                                <p className="text-sm text-blue-700 mt-1">
                                  {nextStep.description}
                                </p>
                              )}
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
