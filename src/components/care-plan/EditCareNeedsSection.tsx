import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckboxWithLabel } from "@/components/ui/checkbox-with-label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EditCareNeedsSectionProps {
  data: any;
  onChange: (updatedData: any) => void;
}

export function EditCareNeedsSection({ data, onChange }: EditCareNeedsSectionProps) {
  const [localData, setLocalData] = useState<any>(data || {});
  
  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);
  
  const handleChange = (field: string, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  if (!data) return null;
  
  return (
    <div className="space-y-8">
      {/* Daily Living Assistance Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Daily Living Assistance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <CheckboxWithLabel
            id="assistanceBathing"
            checked={localData.assistanceBathing || false}
            onCheckedChange={(checked) => handleChange("assistanceBathing", checked)}
            label="Bathing Assistance"
          />
          <CheckboxWithLabel
            id="assistanceDressing"
            checked={localData.assistanceDressing || false}
            onCheckedChange={(checked) => handleChange("assistanceDressing", checked)}
            label="Dressing Assistance"
          />
          <CheckboxWithLabel
            id="assistanceToileting"
            checked={localData.assistanceToileting || false}
            onCheckedChange={(checked) => handleChange("assistanceToileting", checked)}
            label="Toileting Assistance"
          />
          <CheckboxWithLabel
            id="assistanceOralCare"
            checked={localData.assistanceOralCare || false}
            onCheckedChange={(checked) => handleChange("assistanceOralCare", checked)}
            label="Oral Care Assistance"
          />
          <CheckboxWithLabel
            id="assistanceFeeding"
            checked={localData.assistanceFeeding || false}
            onCheckedChange={(checked) => handleChange("assistanceFeeding", checked)}
            label="Feeding Assistance"
          />
          <CheckboxWithLabel
            id="assistanceMobility"
            checked={localData.assistanceMobility || false}
            onCheckedChange={(checked) => handleChange("assistanceMobility", checked)}
            label="Mobility Assistance"
          />
          <CheckboxWithLabel
            id="assistanceMedication"
            checked={localData.assistanceMedication || false}
            onCheckedChange={(checked) => handleChange("assistanceMedication", checked)}
            label="Medication Management"
          />
          <CheckboxWithLabel
            id="assistanceCompanionship"
            checked={localData.assistanceCompanionship || false}
            onCheckedChange={(checked) => handleChange("assistanceCompanionship", checked)}
            label="Companionship"
          />
        </div>
      </div>

      {/* Cognitive & Memory Support */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cognitive & Memory Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <CheckboxWithLabel
            id="dementiaRedirection"
            checked={localData.dementiaRedirection || false}
            onCheckedChange={(checked) => handleChange("dementiaRedirection", checked)}
            label="Dementia Redirection"
          />
          <CheckboxWithLabel
            id="memoryReminders"
            checked={localData.memoryReminders || false}
            onCheckedChange={(checked) => handleChange("memoryReminders", checked)}
            label="Memory Reminders"
          />
          <CheckboxWithLabel
            id="gentleEngagement"
            checked={localData.gentleEngagement || false}
            onCheckedChange={(checked) => handleChange("gentleEngagement", checked)}
            label="Gentle Engagement"
          />
          <CheckboxWithLabel
            id="wanderingPrevention"
            checked={localData.wanderingPrevention || false}
            onCheckedChange={(checked) => handleChange("wanderingPrevention", checked)}
            label="Wandering Prevention"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cognitiveNotes">Cognitive Notes</Label>
          <Textarea 
            id="cognitiveNotes"
            value={localData.cognitiveNotes || ""}
            onChange={(e) => handleChange("cognitiveNotes", e.target.value)}
            placeholder="Any specific cognitive support needs or approaches"
            rows={3}
          />
        </div>
      </div>

      {/* Medical & Special Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Medical & Special Conditions</h3>
        
        <div className="space-y-2">
          <Label htmlFor="diagnosedConditions">Diagnosed Conditions</Label>
          <Textarea 
            id="diagnosedConditions"
            value={localData.diagnosedConditions || ""}
            onChange={(e) => handleChange("diagnosedConditions", e.target.value)}
            placeholder="List any diagnosed conditions"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <CheckboxWithLabel
            id="equipmentUse"
            checked={localData.equipmentUse || false}
            onCheckedChange={(checked) => handleChange("equipmentUse", checked)}
            label="Requires Equipment Use"
          />
          <CheckboxWithLabel
            id="fallMonitoring"
            checked={localData.fallMonitoring || false}
            onCheckedChange={(checked) => handleChange("fallMonitoring", checked)}
            label="Fall Monitoring Required"
          />
          <CheckboxWithLabel
            id="vitalsCheck"
            checked={localData.vitalsCheck || false}
            onCheckedChange={(checked) => handleChange("vitalsCheck", checked)}
            label="Vitals Check Required"
          />
        </div>
      </div>

      {/* Housekeeping & Transportation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Housekeeping & Transportation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <CheckboxWithLabel
            id="tidyRoom"
            checked={localData.tidyRoom || false}
            onCheckedChange={(checked) => handleChange("tidyRoom", checked)}
            label="Tidy Room"
          />
          <CheckboxWithLabel
            id="laundrySupport"
            checked={localData.laundrySupport || false}
            onCheckedChange={(checked) => handleChange("laundrySupport", checked)}
            label="Laundry Support"
          />
          <CheckboxWithLabel
            id="groceryRuns"
            checked={localData.groceryRuns || false}
            onCheckedChange={(checked) => handleChange("groceryRuns", checked)}
            label="Grocery Runs"
          />
          <CheckboxWithLabel
            id="mealPrep"
            checked={localData.mealPrep || false}
            onCheckedChange={(checked) => handleChange("mealPrep", checked)}
            label="Meal Preparation"
          />
          <CheckboxWithLabel
            id="escortToAppointments"
            checked={localData.escortToAppointments || false}
            onCheckedChange={(checked) => handleChange("escortToAppointments", checked)}
            label="Escort to Appointments"
          />
          <CheckboxWithLabel
            id="freshAirWalks"
            checked={localData.freshAirWalks || false}
            onCheckedChange={(checked) => handleChange("freshAirWalks", checked)}
            label="Fresh Air Walks"
          />
        </div>
      </div>
      
      {/* Schedule Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Schedule Preferences</h3>
        
        <div className="space-y-2">
          <Label htmlFor="planType">Care Plan Type</Label>
          <Select 
            value={localData.planType || "scheduled"} 
            onValueChange={(value) => handleChange("planType", value)}
          >
            <SelectTrigger id="planType">
              <SelectValue placeholder="Select plan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled Care</SelectItem>
              <SelectItem value="on-demand">On-Demand Care</SelectItem>
              <SelectItem value="both">Both Scheduled & On-Demand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className={cn("space-y-2", localData.planType === "on-demand" ? "opacity-50 pointer-events-none" : "")}>
          <Label>Weekday Coverage</Label>
          <RadioGroup 
            value={localData.weekdayCoverage || "none"} 
            onValueChange={(value) => handleChange("weekdayCoverage", value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="cursor-pointer">None</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="8am-4pm" id="standard" />
              <Label htmlFor="standard" className="cursor-pointer">Standard (8AM-4PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="8am-6pm" id="extended" />
              <Label htmlFor="extended" className="cursor-pointer">Extended (8AM-6PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6am-6pm" id="full" />
              <Label htmlFor="full" className="cursor-pointer">Full Day (6AM-6PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6pm-8am" id="overnight" />
              <Label htmlFor="overnight" className="cursor-pointer">Overnight (6PM-8AM)</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className={cn("space-y-2", localData.planType === "on-demand" ? "opacity-50 pointer-events-none" : "")}>
          <Label>Weekend Coverage</Label>
          <RadioGroup 
            value={localData.weekendCoverage === "yes" ? "yes" : "no"} 
            onValueChange={(value) => {
              handleChange("weekendCoverage", value);
              if (value === "no") {
                handleChange("weekendScheduleType", "none");
              } else if (value === "yes" && localData.weekendScheduleType === "none") {
                handleChange("weekendScheduleType", "8am-6pm");
              }
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="weekend_no" />
              <Label htmlFor="weekend_no" className="cursor-pointer">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="weekend_yes" />
              <Label htmlFor="weekend_yes" className="cursor-pointer">Yes</Label>
            </div>
          </RadioGroup>
        </div>
        
        {localData.weekendCoverage === "yes" && localData.planType !== "on-demand" && (
          <div className="space-y-2">
            <Label>Weekend Schedule Type</Label>
            <RadioGroup 
              value={localData.weekendScheduleType || "8am-6pm"} 
              onValueChange={(value) => handleChange("weekendScheduleType", value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="8am-6pm" id="weekend_extended" />
                <Label htmlFor="weekend_extended" className="cursor-pointer">Extended Day (8AM-6PM)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6am-6pm" id="weekend_full" />
                <Label htmlFor="weekend_full" className="cursor-pointer">Full Day (6AM-6PM)</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
    </div>
  );
}
