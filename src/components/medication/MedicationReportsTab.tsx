
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar, Download, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { medicationService, MedicationWithAdministrations } from "@/services/medicationService";
import { toast } from "sonner";

interface MedicationReportsTabProps {
  carePlanId: string;
}

interface AdherenceData {
  medicationName: string;
  totalDoses: number;
  administeredDoses: number;
  adherenceRate: number;
  conflicts: number;
}

export function MedicationReportsTab({ carePlanId }: MedicationReportsTabProps) {
  const [medications, setMedications] = useState<MedicationWithAdministrations[]>([]);
  const [adherenceData, setAdherenceData] = useState<AdherenceData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedicationsAndAnalytics();
  }, [carePlanId, selectedPeriod]);

  const loadMedicationsAndAnalytics = async () => {
    setIsLoading(true);
    try {
      const medicationData = await medicationService.getMedicationsForCarePlan(carePlanId);
      setMedications(medicationData);
      
      const analytics = await generateAdherenceAnalytics(medicationData);
      setAdherenceData(analytics);
    } catch (error) {
      console.error("Error loading medication analytics:", error);
      toast.error("Failed to load medication reports");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdherenceAnalytics = async (meds: MedicationWithAdministrations[]): Promise<AdherenceData[]> => {
    const days = parseInt(selectedPeriod);
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const analytics: AdherenceData[] = [];

    for (const med of meds) {
      // Get all administrations for this medication in the period
      const administrations = await medicationService.getMedicationAdministrationsWithConflicts(med.id, 100);
      
      const periodAdministrations = administrations.filter(admin => {
        const adminDate = new Date(admin.administered_at);
        return adminDate >= startDate && adminDate <= endDate && admin.status === 'administered';
      });

      // Calculate expected doses
      const scheduledTimes = med.schedule?.times || [];
      const expectedDoses = days * scheduledTimes.length;
      
      // Count conflicts
      const conflicts = periodAdministrations.filter(admin => admin.conflict_detected).length;

      analytics.push({
        medicationName: med.name,
        totalDoses: expectedDoses,
        administeredDoses: periodAdministrations.length,
        adherenceRate: expectedDoses > 0 ? Math.round((periodAdministrations.length / expectedDoses) * 100) : 0,
        conflicts: conflicts
      });
    }

    return analytics;
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-100";
    if (rate >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const exportReport = () => {
    const reportData = {
      period: `${selectedPeriod} days`,
      generatedAt: new Date().toISOString(),
      medications: adherenceData
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `medication-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  const overallAdherence = adherenceData.length > 0 
    ? Math.round(adherenceData.reduce((sum, med) => sum + med.adherenceRate, 0) / adherenceData.length)
    : 0;

  const totalConflicts = adherenceData.reduce((sum, med) => sum + med.conflicts, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading medication reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Medication Adherence Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallAdherence}%</div>
              <div className="text-sm text-muted-foreground">Overall Adherence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{medications.length}</div>
              <div className="text-sm text-muted-foreground">Active Medications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalConflicts}</div>
              <div className="text-sm text-muted-foreground">Administration Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Adherence Details */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Adherence Details</CardTitle>
        </CardHeader>
        <CardContent>
          {adherenceData.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No data available</h3>
              <p className="text-muted-foreground">
                No medications or administration data found for the selected period.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {adherenceData.map((med, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{med.medicationName}</h4>
                    <Badge className={getAdherenceColor(med.adherenceRate)}>
                      {med.adherenceRate}% Adherence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Expected Doses</div>
                      <div className="font-medium">{med.totalDoses}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Administered</div>
                      <div className="font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {med.administeredDoses}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Missed Doses</div>
                      <div className="font-medium text-red-600">
                        {med.totalDoses - med.administeredDoses}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conflicts</div>
                      <div className="font-medium flex items-center gap-1">
                        {med.conflicts > 0 && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                        {med.conflicts}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{med.administeredDoses}/{med.totalDoses}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          med.adherenceRate >= 90 ? 'bg-green-500' :
                          med.adherenceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (med.administeredDoses / med.totalDoses) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overallAdherence >= 90 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Excellent Adherence</div>
                  <div className="text-sm text-green-700">
                    Your medication adherence is excellent. Keep up the great work!
                  </div>
                </div>
              </div>
            )}
            
            {overallAdherence < 70 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Adherence Needs Improvement</div>
                  <div className="text-sm text-red-700">
                    Consider setting up medication reminders or discussing with your healthcare provider.
                  </div>
                </div>
              </div>
            )}
            
            {totalConflicts > 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800">Administration Conflicts Detected</div>
                  <div className="text-sm text-orange-700">
                    {totalConflicts} conflict(s) were detected and safely recorded. Review communication with your care team.
                  </div>
                </div>
              </div>
            )}
            
            {adherenceData.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Get Started</div>
                  <div className="text-sm text-blue-700">
                    Add medications and start tracking to see your adherence insights here.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
