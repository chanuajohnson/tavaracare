
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Pill, Edit, Trash2, CheckCircle2, AlertCircle, User } from "lucide-react";
import { MedicationWithAdministrations } from "@/services/medicationService";
import { formatDistanceToNow } from "date-fns";

interface MedicationCardProps {
  medication: MedicationWithAdministrations;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdminister?: () => void;
  onViewHistory?: () => void;
  showAdminActions?: boolean;
  showEditActions?: boolean;
  userRole?: 'family' | 'professional';
}

export const MedicationCard = ({
  medication,
  onEdit,
  onDelete,
  onAdminister,
  onViewHistory,
  showAdminActions = false,
  showEditActions = false,
  userRole = 'family'
}: MedicationCardProps) => {
  const getStatusColor = (adherenceRate?: number) => {
    if (!adherenceRate) return "bg-gray-100 text-gray-600";
    if (adherenceRate >= 90) return "bg-green-100 text-green-800";
    if (adherenceRate >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getNextDoseInfo = (nextDose?: string) => {
    if (!nextDose) return null;
    const doseTime = new Date(nextDose);
    const now = new Date();
    const isOverdue = doseTime < now;
    
    return {
      time: doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: formatDistanceToNow(doseTime, { addSuffix: true }),
      isOverdue
    };
  };

  const getAdministratorName = (administration: any) => {
    const profile = administration.administered_by_profile || administration.profiles;
    
    if (profile?.full_name) {
      return profile.full_name;
    }
    
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    
    // Fallback based on role
    if (administration.administered_by_role === 'family') {
      return 'family member';
    }
    
    return 'caregiver';
  };

  const nextDoseInfo = getNextDoseInfo(medication.next_dose);
  const lastAdministration = medication.recent_administrations?.[0];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">{medication.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {medication.medication_type && (
              <Badge variant="outline">{medication.medication_type}</Badge>
            )}
            {medication.adherence_rate !== undefined && (
              <Badge className={getStatusColor(medication.adherence_rate)}>
                {medication.adherence_rate}% adherence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dosage and Instructions */}
        <div className="space-y-2">
          {medication.dosage && (
            <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
          )}
          {medication.instructions && (
            <p><span className="font-medium">Instructions:</span> {medication.instructions}</p>
          )}
          {medication.special_instructions && (
            <div className="p-2 bg-amber-50 border-l-4 border-amber-400 rounded">
              <p className="text-sm"><span className="font-medium">Special Instructions:</span> {medication.special_instructions}</p>
            </div>
          )}
        </div>

        {/* Next Dose Information */}
        {nextDoseInfo && (
          <div className={`flex items-center gap-2 p-2 rounded ${nextDoseInfo.isOverdue ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Next dose: {nextDoseInfo.time} ({nextDoseInfo.relative})
              {nextDoseInfo.isOverdue && " - OVERDUE"}
            </span>
          </div>
        )}

        {/* Last Administration */}
        {lastAdministration && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {lastAdministration.status === 'administered' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span>
              Last {lastAdministration.status}: {new Date(lastAdministration.administered_at).toLocaleDateString()} 
              <span className="ml-1">by {getAdministratorName(lastAdministration)}</span>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {showAdminActions && onAdminister && (
            <Button 
              onClick={onAdminister}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark Administered
            </Button>
          )}
          
          {onViewHistory && (
            <Button 
              onClick={onViewHistory}
              variant="outline"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-1" />
              View History
            </Button>
          )}

          {showEditActions && onEdit && (
            <Button 
              onClick={onEdit}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}

          {showEditActions && onDelete && (
            <Button 
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
