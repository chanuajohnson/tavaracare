
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calendar,
  Users,
  MapPin,
  CreditCard,
  Star,
  AlertCircle,
  Video
} from 'lucide-react';
import { JourneyStageCard } from './JourneyStageCard';
import { JourneyPathVisualization } from './JourneyPathVisualization';
import { useFamilyJourneyProgress } from '@/hooks/useFamilyJourneyProgress';
import { useVisitBookings } from '@/hooks/useVisitBookings';
import { InternalSchedulingModal } from './InternalSchedulingModal';

interface EnhancedFamilyNextStepsPanelProps {
  showAllSteps?: boolean;
}

export const EnhancedFamilyNextStepsPanel: React.FC<EnhancedFamilyNextStepsPanelProps> = ({ 
  showAllSteps = false 
}) => {
  const { 
    completionPercentage, 
    nextStep, 
    journeyStage, 
    currentStepIndex,
    totalSteps,
    allSteps,
    trialCompleted,
    careModel
  } = useFamilyJourneyProgress();

  const { activeBooking, refetch: refetchBookings } = useVisitBookings();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const handleRescheduleVisit = () => {
    setShowRescheduleModal(true);
  };

  const handleVisitRescheduled = () => {
    refetchBookings();
    setShowRescheduleModal(false);
  };

  // Get visit status based on booking and admin status
  const getVisitStatus = () => {
    if (!activeBooking) return 'not_scheduled';
    if (activeBooking.admin_status === 'completed') return 'completed';
    if (activeBooking.admin_status === 'confirmed') return 'in_progress';
    return 'scheduled';
  };

  const visitStatus = getVisitStatus();

  // Update step 8 based on visit status
  const updatedSteps = allSteps.map(step => {
    if (step.id === 8) {
      const status = getVisitStatus();
      return {
        ...step,
        completed: status === 'completed',
        status: status === 'completed' ? 'Complete' : 
                status === 'in_progress' ? 'In Progress' : 
                status === 'scheduled' ? 'Scheduled' : 'Complete',
        buttonText: status === 'scheduled' ? 'Modify Visit' : step.status,
        clickable: status === 'scheduled',
        action: status === 'scheduled' ? handleRescheduleVisit : undefined
      };
    }
    return step;
  });

  const stepsToShow = showAllSteps ? updatedSteps : updatedSteps.slice(0, 6);

  // Create default props for JourneyPathVisualization
  const defaultPaths = [
    {
      id: '1',
      path_name: 'Standard Care Path',
      path_description: 'Complete all steps at your own pace for comprehensive care setup',
      step_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      path_color: '#3B82F6',
      is_recommended: true
    },
    {
      id: '2', 
      path_name: 'Express Path',
      path_description: 'Fast-track essential steps for urgent care needs',
      step_ids: [1, 3, 6, 7, 8],
      path_color: '#F59E0B',
      is_recommended: false
    }
  ];

  const defaultJourneySteps = allSteps.map(step => ({
    step_number: step.id,
    title: step.title,
    category: step.id <= 3 ? 'foundation' : step.id <= 6 ? 'scheduling' : step.id <= 7 ? 'trial' : 'conversion',
    completed: step.completed,
    accessible: true
  }));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Your Care Journey</h1>
        <p className="text-lg text-gray-600">
          Follow these steps to get matched with the perfect caregiver for your loved one.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-900">Journey Progress</CardTitle>
              <CardDescription className="text-blue-700">
                {currentStepIndex} of {totalSteps} steps completed
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{completionPercentage}%</div>
              <div className="text-sm text-blue-700">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-3 mb-4" />
          
          {/* Journey Stage Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              Stage: {journeyStage?.charAt(0).toUpperCase() + journeyStage?.slice(1) || 'Foundation'}
            </Badge>
            {careModel && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                {careModel === 'urgent_care' ? 'Fast Track' : 'Standard Path'}
              </Badge>
            )}
          </div>

          {/* Next Step Highlight */}
          {nextStep && (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{nextStep.title}</h3>
                  <p className="text-sm text-gray-600">{nextStep.description}</p>
                </div>
                {nextStep.action && (
                  <Button onClick={nextStep.action} size="sm">
                    Continue
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Booking Status */}
      {activeBooking && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeBooking.visit_type === 'virtual' ? (
                  <Video className="h-5 w-5 text-green-600" />
                ) : (
                  <MapPin className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <CardTitle className="text-lg">Your Scheduled Visit</CardTitle>
                  <CardDescription>
                    {activeBooking.visit_type === 'virtual' ? 'Virtual' : 'In-Person'} visit scheduled
                  </CardDescription>
                </div>
              </div>
              <Badge variant={
                visitStatus === 'completed' ? 'default' : 
                visitStatus === 'in_progress' ? 'secondary' : 'outline'
              }>
                {visitStatus === 'completed' ? 'Completed' : 
                 visitStatus === 'in_progress' ? 'In Progress' : 'Scheduled'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {new Date(activeBooking.booking_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  at {activeBooking.booking_time.slice(0, 5)}
                </p>
                {activeBooking.reschedule_count > 0 && (
                  <p className="text-xs text-amber-600">
                    Rescheduled {activeBooking.reschedule_count} time{activeBooking.reschedule_count > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {visitStatus === 'scheduled' && (
                <Button variant="outline" onClick={handleRescheduleVisit}>
                  Modify Visit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Path Visualization */}
      {showAllSteps && (
        <Card>
          <CardHeader>
            <CardTitle>Your Journey Path</CardTitle>
            <CardDescription>
              Visual representation of your care journey steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JourneyPathVisualization 
              paths={defaultPaths}
              steps={defaultJourneySteps}
              currentStage={journeyStage || 'foundation'}
            />
          </CardContent>
        </Card>
      )}

      {/* Journey Steps */}
      <div className="grid gap-4">
        {stepsToShow.map((step, index) => (
          <JourneyStageCard
            key={step.id}
            step={step}
            isActive={index === currentStepIndex}
            isCompleted={step.completed}
            stepNumber={index + 1}
          />
        ))}
      </div>

      {/* Show More Steps Button */}
      {!showAllSteps && allSteps.length > 6 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.href = '/family/care-journey-progress'}>
            View All Steps ({allSteps.length - 6} more)
          </Button>
        </div>
      )}

      {/* Reschedule Modal */}
      {activeBooking && (
        <InternalSchedulingModal
          open={showRescheduleModal}
          onOpenChange={setShowRescheduleModal}
          onVisitScheduled={handleVisitRescheduled}
          mode="reschedule"
          existingBooking={{
            id: activeBooking.id,
            booking_date: activeBooking.booking_date,
            booking_time: activeBooking.booking_time,
            visit_type: activeBooking.visit_type,
            reschedule_count: activeBooking.reschedule_count,
            availability_slot_id: activeBooking.availability_slot_id
          }}
        />
      )}
    </div>
  );
};
