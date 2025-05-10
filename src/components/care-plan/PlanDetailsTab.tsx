import { CarePlan } from "@/types/carePlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Info, Users, AlertCircle, CheckCircle, Heart, Brain, Activity, Home, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { fetchFamilyCareNeeds } from "@/services/familyCareNeedsService";
import { DescriptionInput } from "./DescriptionInput";

interface PlanDetailsTabProps {
  carePlan: CarePlan;
}

export function PlanDetailsTab({ carePlan }: PlanDetailsTabProps) {
  const [careNeeds, setCareNeeds] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCareNeeds = async () => {
      if (carePlan.familyId) {
        setLoading(true);
        try {
          const needsData = await fetchFamilyCareNeeds(carePlan.familyId);
          setCareNeeds(needsData);
          console.log("Care needs loaded:", needsData);
        } catch (err) {
          console.error("Failed to load care needs:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCareNeeds();
  }, [carePlan.familyId]);

  // Helper function to get a human-readable schedule description
  const getScheduleDescription = (schedule?: string): string => {
    switch(schedule) {
      case '8am-4pm':
        return 'Monday - Friday, 8 AM - 4 PM (Standard daytime coverage)';
      case '8am-6pm':
        return 'Monday - Friday, 8 AM - 6 PM (Extended evening coverage)';
      case '6am-6pm':
        return 'Monday - Friday, 6 AM - 6 PM (Full daytime coverage)';
      case '6pm-8am':
        return 'Monday - Friday, 6 PM - 8 AM (Overnight coverage)';
      case 'none':
        return 'No weekday coverage selected';
      default:
        return 'Custom schedule (see details)';
    }
  };

  // Helper function to get a human-readable weekend schedule description
  const getWeekendScheduleDescription = (coverage?: string, scheduleType?: string): string => {
    if (coverage !== 'yes') {
      return 'No weekend coverage';
    }
    
    // Handle specific weekend schedule types
    switch(scheduleType) {
      case '8am-6pm':
        return 'Saturday - Sunday, 8 AM - 6 PM (Standard weekend coverage)';
      case '6am-6pm':
        return 'Saturday - Sunday, 6 AM - 6 PM (Full daytime weekend coverage)';
      default:
        return 'Saturday - Sunday, 6 AM - 6 PM (Default weekend coverage)';
    }
  };

  const getPlanTypeBadge = (type?: string) => {
    switch(type) {
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled Care</Badge>;
      case 'on-demand':
        return <Badge className="bg-purple-500">On-Demand Care</Badge>;
      case 'both':
        return <Badge className="bg-teal-500">Scheduled + On-Demand</Badge>;
      default:
        return <Badge>Care Plan</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500 mr-1" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
      default:
        return <Info className="h-4 w-4 text-gray-500 mr-1" />;
    }
  };

  // Create sections for care needs if data is available
  const hasDailyLivingNeeds = careNeeds && (
    careNeeds.assistanceBathing || 
    careNeeds.assistanceDressing || 
    careNeeds.assistanceToileting || 
    careNeeds.assistanceOralCare || 
    careNeeds.assistanceFeeding || 
    careNeeds.assistanceMobility || 
    careNeeds.assistanceMedication ||
    careNeeds.assistanceNaps
  );

  const hasCognitiveNeeds = careNeeds && (
    careNeeds.dementiaRedirection ||
    careNeeds.memoryReminders ||
    careNeeds.gentleEngagement ||
    careNeeds.wanderingPrevention
  );

  const hasMedicalNeeds = careNeeds && (
    careNeeds.diagnosedConditions ||
    careNeeds.equipmentUse ||
    careNeeds.fallMonitoring ||
    careNeeds.vitalsCheck
  );

  const hasHousekeepingNeeds = careNeeds && (
    careNeeds.tidyRoom ||
    careNeeds.laundrySupport ||
    careNeeds.groceryRuns ||
    careNeeds.mealPrep ||
    careNeeds.escortToAppointments ||
    careNeeds.freshAirWalks
  );

  const hasEmergencyInfo = careNeeds && (
    careNeeds.emergencyContactName ||
    careNeeds.emergencyContactPhone ||
    careNeeds.communicationMethod ||
    careNeeds.dailyReportRequired
  );

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{carePlan.title}</CardTitle>
            <div className="flex gap-2">
              {getPlanTypeBadge(carePlan.metadata?.planType)}
              <Badge variant={carePlan.status === 'active' ? 'default' : 'outline'} className="flex items-center">
                {getStatusIcon(carePlan.status)}
                {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Created {formatDistanceToNow(new Date(carePlan.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Plan Description</h3>
              {carePlan.description ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">
                    "{carePlan.description}"
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No description provided.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Schedule Information Card */}
      {carePlan.metadata?.planType !== 'on-demand' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Schedule Information
            </CardTitle>
            <CardDescription>Weekday and weekend coverage details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {carePlan.metadata?.weekdayCoverage && carePlan.metadata.weekdayCoverage !== 'none' && (
                <div className="bg-gray-50 border rounded-md p-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Weekday Schedule</h4>
                  <p className="text-gray-600">
                    {getScheduleDescription(carePlan.metadata.weekdayCoverage)}
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 border rounded-md p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Weekend Schedule</h4>
                <p className="text-gray-600">
                  {getWeekendScheduleDescription(
                    carePlan.metadata?.weekendCoverage,
                    carePlan.metadata?.weekendScheduleType
                  )}
                </p>
              </div>
              
              {carePlan.metadata?.customShifts && carePlan.metadata.customShifts.length > 0 && (
                <div className="bg-gray-50 border rounded-md p-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Custom Schedules</h4>
                  <ul className="space-y-2 divide-y divide-gray-200">
                    {carePlan.metadata.customShifts.map((shift: any, index: number) => (
                      <li key={index} className="pt-2 first:pt-0">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {Array.isArray(shift.days) && shift.days.length > 0 ? 
                                shift.days
                                  .map((d: string) => d.charAt(0).toUpperCase() + d.slice(1))
                                  .join(', ')
                                : 'Custom days'}
                            </span>
                            {(shift.startTime && shift.endTime) && (
                              <span className="text-gray-600">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            )}
                          </div>
                          {shift.title && (
                            <span className="text-xs text-gray-500 mt-1">{shift.title}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Care Requirements Card - only show if care needs data is available */}
      {(hasDailyLivingNeeds || hasCognitiveNeeds || hasMedicalNeeds || hasHousekeepingNeeds) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Heart className="mr-2 h-5 w-5 text-primary" />
              Care Requirements
            </CardTitle>
            <CardDescription>Daily assistance and support needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Daily Living Section */}
              {hasDailyLivingNeeds && (
                <div>
                  <h3 className="font-medium text-sm text-primary flex items-center mb-3">
                    <Users className="mr-2 h-4 w-4" /> 
                    Activities of Daily Living
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {careNeeds.assistanceBathing && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Bathing Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceDressing && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Dressing Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceToileting && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Toileting Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceOralCare && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Oral Care Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceFeeding && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Feeding Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceMobility && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Mobility Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceMedication && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Medication Assistance</span>
                      </div>
                    )}
                    {careNeeds.assistanceNaps && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Nap/Rest Assistance</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cognitive Support Section */}
              {hasCognitiveNeeds && (
                <div>
                  <h3 className="font-medium text-sm text-primary flex items-center mb-3">
                    <Brain className="mr-2 h-4 w-4" /> 
                    Cognitive & Memory Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {careNeeds.dementiaRedirection && (
                      <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Dementia Redirection</span>
                      </div>
                    )}
                    {careNeeds.memoryReminders && (
                      <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Memory Reminders</span>
                      </div>
                    )}
                    {careNeeds.gentleEngagement && (
                      <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Gentle Engagement</span>
                      </div>
                    )}
                    {careNeeds.wanderingPrevention && (
                      <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Wandering Prevention</span>
                      </div>
                    )}
                  </div>
                  
                  {careNeeds.cognitiveNotes && (
                    <div className="mt-3 bg-gray-50 p-3 rounded border text-sm">
                      <p className="font-medium text-gray-700 mb-1">Cognitive Notes:</p>
                      <p className="text-gray-600">{careNeeds.cognitiveNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Medical & Special Conditions */}
              {hasMedicalNeeds && (
                <div>
                  <h3 className="font-medium text-sm text-primary flex items-center mb-3">
                    <Activity className="mr-2 h-4 w-4" /> 
                    Medical & Special Conditions
                  </h3>
                  
                  {careNeeds.diagnosedConditions && (
                    <div className="mb-3 bg-gray-50 p-3 rounded border text-sm">
                      <p className="font-medium text-gray-700 mb-1">Diagnosed Conditions:</p>
                      <p className="text-gray-600">{careNeeds.diagnosedConditions}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {careNeeds.equipmentUse && (
                      <div className="bg-teal-50 text-teal-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Equipment Use</span>
                      </div>
                    )}
                    {careNeeds.fallMonitoring && (
                      <div className="bg-teal-50 text-teal-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Fall Monitoring</span>
                      </div>
                    )}
                    {careNeeds.vitalsCheck && (
                      <div className="bg-teal-50 text-teal-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Vitals Check</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Housekeeping & Transportation */}
              {hasHousekeepingNeeds && (
                <div>
                  <h3 className="font-medium text-sm text-primary flex items-center mb-3">
                    <Home className="mr-2 h-4 w-4" /> 
                    Housekeeping & Transportation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {careNeeds.tidyRoom && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Room Tidying</span>
                      </div>
                    )}
                    {careNeeds.laundrySupport && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Laundry Support</span>
                      </div>
                    )}
                    {careNeeds.groceryRuns && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Grocery Runs</span>
                      </div>
                    )}
                    {careNeeds.mealPrep && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Meal Preparation</span>
                      </div>
                    )}
                    {careNeeds.escortToAppointments && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Appointment Escort</span>
                      </div>
                    )}
                    {careNeeds.freshAirWalks && (
                      <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm flex items-center">
                        <span className="font-medium">Fresh Air Walks</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency & Communication Card */}
      {hasEmergencyInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Phone className="mr-2 h-5 w-5 text-primary" />
              Emergency & Communication
            </CardTitle>
            <CardDescription>Contact information and reporting preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {careNeeds.emergencyContactName && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Emergency Contact</h4>
                <div className="mt-2 bg-gray-50 p-3 rounded border">
                  <p className="text-sm">
                    <strong>{careNeeds.emergencyContactName}</strong>
                    {careNeeds.emergencyContactRelationship && <span className="text-gray-500"> ({careNeeds.emergencyContactRelationship})</span>}
                  </p>
                  {careNeeds.emergencyContactPhone && (
                    <p className="text-sm mt-1">{careNeeds.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            )}
            
            {(careNeeds.communicationMethod || careNeeds.dailyReportRequired) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Communication Preferences</h4>
                <div className="space-y-2">
                  {careNeeds.communicationMethod && (
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm">
                        <strong>Preferred Method:</strong> {careNeeds.communicationMethod}
                      </p>
                    </div>
                  )}
                  
                  {careNeeds.dailyReportRequired && (
                    <div className="flex items-center">
                      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </span>
                      <span className="text-sm">Daily care report requested</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {careNeeds.additionalNotes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm text-gray-600">{careNeeds.additionalNotes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Technical Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Info className="mr-2 h-5 w-5 text-primary" /> 
            Technical Details
          </CardTitle>
          <CardDescription>Reference information about this care plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Plan ID</h4>
                <p className="text-xs text-gray-500 mt-1 font-mono">{carePlan.id}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(carePlan.createdAt).toLocaleDateString()} 
                  {" "}
                  {new Date(carePlan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Last Updated</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(carePlan.updatedAt).toLocaleDateString()}
                  {" "}
                  {new Date(carePlan.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Plan Type</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {carePlan.metadata?.planType ? carePlan.metadata.planType.charAt(0).toUpperCase() + carePlan.metadata.planType.slice(1) : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
