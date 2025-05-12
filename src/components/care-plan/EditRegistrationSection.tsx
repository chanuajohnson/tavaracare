
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxWithLabel } from "@/components/ui/checkbox-with-label";

interface EditRegistrationSectionProps {
  data: any;
  onChange: (updatedData: any) => void;
}

export function EditRegistrationSection({ data, onChange }: EditRegistrationSectionProps) {
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
  
  const relationships = [
    "Parent", "Child", "Sibling", "Grandparent", "Grandchild", 
    "Spouse", "Partner", "Friend", "Other"
  ];

  const careTypes = [
    "Personal Care", "Memory Care", "Medication Management", 
    "Mobility Assistance", "Companionship", "Respite Care"
  ];
  
  const specialNeeds = [
    "Alzheimer's", "Dementia", "Parkinson's", "Multiple Sclerosis",
    "Stroke Recovery", "Cancer Care", "Diabetes", "Heart Disease",
    "Post-Surgery", "Hospice Support", "Physical Disability", "Other"
  ];

  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Full Name</Label>
            <Input 
              id="fullName"
              value={localData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber"
              value={localData.phoneNumber || ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="Your phone number"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Care Recipient Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="careRecipientName">Care Recipient Name</Label>
            <Input 
              id="careRecipientName"
              value={localData.care_recipient_name || ""}
              onChange={(e) => handleChange("care_recipient_name", e.target.value)}
              placeholder="Name of person receiving care"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship to You</Label>
            <Select 
              value={localData.relationship || ""} 
              onValueChange={(value) => handleChange("relationship", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((relationship) => (
                  <SelectItem key={relationship} value={relationship.toLowerCase()}>
                    {relationship}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea 
            id="address"
            value={localData.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Care recipient's address"
            rows={2}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Care Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {careTypes.map((type) => {
            const typeId = type.toLowerCase().replace(/\s/g, '_');
            const isSelected = localData.care_types?.includes(typeId);
            
            return (
              <CheckboxWithLabel 
                key={typeId}
                id={`care_type_${typeId}`}
                checked={isSelected || false}
                onCheckedChange={(checked) => {
                  const currentTypes = localData.care_types || [];
                  const updatedTypes = checked 
                    ? [...currentTypes, typeId] 
                    : currentTypes.filter((t: string) => t !== typeId);
                  
                  handleChange("care_types", updatedTypes);
                }}
                label={type}
              />
            );
          })}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Special Needs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {specialNeeds.map((need) => {
            const needId = need.toLowerCase().replace(/\s/g, '_').replace(/'/g, '');
            const isSelected = localData.special_needs?.includes(needId);
            
            return (
              <CheckboxWithLabel 
                key={needId}
                id={`special_need_${needId}`}
                checked={isSelected || false}
                onCheckedChange={(checked) => {
                  const currentNeeds = localData.special_needs || [];
                  const updatedNeeds = checked 
                    ? [...currentNeeds, needId] 
                    : currentNeeds.filter((n: string) => n !== needId);
                  
                  handleChange("special_needs", updatedNeeds);
                }}
                label={need}
              />
            );
          })}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea 
          id="additionalNotes"
          value={localData.additional_notes || ""}
          onChange={(e) => handleChange("additional_notes", e.target.value)}
          placeholder="Any additional information we should know"
          rows={3}
        />
      </div>
    </div>
  );
}
