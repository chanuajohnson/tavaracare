
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EditPlanDetailsSectionProps {
  data: any;
  onChange: (updatedData: any) => void;
}

export function EditPlanDetailsSection({ data, onChange }: EditPlanDetailsSectionProps) {
  const [localData, setLocalData] = useState<any>(data || {});
  
  useEffect(() => {
    if (data) {
      setLocalData(data);
      
      // Make sure metadata is initialized
      if (!data.metadata) {
        handleChange("metadata", {
          planType: "scheduled",
          weekdayCoverage: "none",
          weekendCoverage: "no",
          weekendScheduleType: "none"
        });
      }
    }
  }, [data]);
  
  const handleChange = (field: string, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };
  
  const handleMetadataChange = (field: string, value: any) => {
    const updatedMetadata = { 
      ...(localData.metadata || {}), 
      [field]: value 
    };
    
    // Handle special case for switching plan type to on-demand
    if (field === "planType" && value === "on-demand") {
      // Reset schedule values if switching to on-demand
      updatedMetadata.weekdayCoverage = "none";
      updatedMetadata.weekendCoverage = "no";
      updatedMetadata.weekendScheduleType = "none";
    }
    
    handleChange("metadata", updatedMetadata);
    
    // Log changes for debugging
    console.log(`Updated ${field} to ${value}`, updatedMetadata);
  };

  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Care Plan Title</Label>
          <Input 
            id="title"
            value={localData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Enter a title for your care plan"
          />
          <p className="text-xs text-muted-foreground">
            A clear title helps you identify this care plan later
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Care Plan Description</Label>
          <Textarea 
            id="description"
            value={localData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Example: Primary home care plan for Dad focusing on mobility assistance and medication management."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Write a brief, personal summary of this care plan (1-2 short sentences max, limited to 150 characters)
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Plan Status</h3>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={localData.status || "active"} 
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Schedule Configuration</h3>
        <div className="space-y-2">
          <Label htmlFor="planType">Plan Type</Label>
          <Select 
            value={localData.metadata?.planType || "scheduled"} 
            onValueChange={(value) => handleMetadataChange("planType", value)}
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
        
        {(localData.metadata?.planType === "scheduled" || localData.metadata?.planType === "both") && (
          <>
            <div className="space-y-2">
              <Label htmlFor="weekdayCoverage">Weekday Coverage</Label>
              <Select 
                value={localData.metadata?.weekdayCoverage || "none"} 
                onValueChange={(value) => handleMetadataChange("weekdayCoverage", value)}
              >
                <SelectTrigger id="weekdayCoverage">
                  <SelectValue placeholder="Select weekday coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="8am-4pm">Standard (8AM-4PM)</SelectItem>
                  <SelectItem value="8am-6pm">Extended (8AM-6PM)</SelectItem>
                  <SelectItem value="6am-6pm">Full Day (6AM-6PM)</SelectItem>
                  <SelectItem value="6pm-8am">Overnight (6PM-8AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weekendCoverage">Weekend Coverage</Label>
              <Select 
                value={localData.metadata?.weekendCoverage || "no"} 
                onValueChange={(value) => {
                  handleMetadataChange("weekendCoverage", value);
                  if (value === "no") {
                    handleMetadataChange("weekendScheduleType", "none");
                  } else if (value === "yes" && (!localData.metadata?.weekendScheduleType || localData.metadata?.weekendScheduleType === "none")) {
                    handleMetadataChange("weekendScheduleType", "8am-6pm");
                  }
                }}
              >
                <SelectTrigger id="weekendCoverage">
                  <SelectValue placeholder="Select weekend coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No Weekend Coverage</SelectItem>
                  <SelectItem value="yes">Weekend Coverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {localData.metadata?.weekendCoverage === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="weekendScheduleType">Weekend Schedule Type</Label>
                <Select 
                  value={localData.metadata?.weekendScheduleType || "8am-6pm"} 
                  onValueChange={(value) => handleMetadataChange("weekendScheduleType", value)}
                >
                  <SelectTrigger id="weekendScheduleType">
                    <SelectValue placeholder="Select weekend schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8am-6pm">Extended Day (8AM-6PM)</SelectItem>
                    <SelectItem value="6am-6pm">Full Day (6AM-6PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
