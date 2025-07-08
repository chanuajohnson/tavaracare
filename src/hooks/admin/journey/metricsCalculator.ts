
import { ConversionMetrics, UserProgress } from './types';

export const calculateConversionMetrics = (
  foundationCompleted: number,
  schedulingCompleted: number,
  trialCompleted: number,
  subscriptionConversions: number,
  directHireConversions: number
): ConversionMetrics => {
  return {
    foundationToScheduling: foundationCompleted > 0 ? (schedulingCompleted / foundationCompleted) * 100 : 0,
    schedulingToTrial: schedulingCompleted > 0 ? (trialCompleted / schedulingCompleted) * 100 : 0,
    trialToSubscription: trialCompleted > 0 ? (subscriptionConversions / trialCompleted) * 100 : 0,
    directHireConversion: trialCompleted > 0 ? (directHireConversions / trialCompleted) * 100 : 0,
    subscriptionConversion: trialCompleted > 0 ? (subscriptionConversions / trialCompleted) * 100 : 0
  };
};

export const aggregateUserProgress = (userProgressList: UserProgress[]) => {
  const aggregation = {
    foundationCompleted: 0,
    schedulingCompleted: 0,
    trialCompleted: 0,
    subscriptionConversions: 0,
    directHireConversions: 0,
    activeJourneyUsers: 0,
    completedJourneyUsers: 0
  };

  userProgressList.forEach(progress => {
    if (progress.foundationCompleted) aggregation.foundationCompleted++;
    if (progress.schedulingCompleted) aggregation.schedulingCompleted++;
    if (progress.trialCompleted) aggregation.trialCompleted++;
    if (progress.subscriptionConversion) aggregation.subscriptionConversions++;
    if (progress.directHireConversion) aggregation.directHireConversions++;
    if (progress.userStepCount > 0) aggregation.activeJourneyUsers++;
    if (progress.userStepCount >= 12) aggregation.completedJourneyUsers++;
  });

  return aggregation;
};
