
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Clipboard, Calendar, Heart, Home, Clock } from "lucide-react";
import { CarePlan } from "@/types/carePlan";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface PlanDetailsTabProps {
  carePlan: CarePlan;
}

export const PlanDetailsTab: React.FC<PlanDetailsTabProps> = ({ carePlan }) => {
  const navigate = useNavigate();
  
  const getPlanTypeDisplay = (plan: CarePlan) => {
    if (!plan.metadata?.planType) return "Not specified";
    
    switch (plan.metadata.planType) {
      case 'scheduled':
        return "Scheduled Care";
      case 'on-demand':
        return "On-demand Care";
      case 'both':
        return "Scheduled & On-demand";
      default:
        return "Not specified";
    }
  };

  const handleEdit = () => {
    navigate(`/family/care-management/create/${carePlan.id}`);
  };

  // Helper function to parse and format the description into sections
  const renderFormattedDescription = () => {
    if (!carePlan.description) return null;

    // Split the description by periods to extract different sections
    const sections = carePlan.description.split('. ').filter(Boolean);
    
    // Initialize section containers
    let medicalConditions = '';
    let assistanceNeeds = '';
    let specialCare = '';
    let cognitiveNotes = '';
    let additionalNotes = '';
    
    // Parse content into appropriate sections
    sections.forEach(section => {
      if (section.includes('Medical conditions:')) {
        medicalConditions = section.replace('Medical conditions:', '').trim();
      } else if (section.includes('Assistance needed with:')) {
        assistanceNeeds = section.replace('Assistance needed with:', '').trim();
      } else if (section.includes('Special care:')) {
        specialCare = section.replace('Special care:', '').trim();
      } else if (section.includes('Cognitive notes:')) {
        cognitiveNotes = section.replace('Cognitive notes:', '').trim();
      } else if (section.includes('Additional notes:')) {
        additionalNotes = section.replace('Additional notes:', '').trim();
      }
    });

    return (
      <div className="space-y-4">
        {medicalConditions && (
          <div className="rounded-md border p-3 bg-background">
            <div className="flex items-center mb-2">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              <h4 className="font-medium">Medical Conditions</h4>
            </div>
            <p className="text-sm text-muted-foreground">{medicalConditions}</p>
          </div>
        )}

        {assistanceNeeds && (
          <div className="rounded-md border p-3 bg-background">
            <div className="flex items-center mb-2">
              <Home className="h-4 w-4 mr-2 text-blue-500" />
              <h4 className="font-medium">Daily Assistance Needs</h4>
            </div>
            <p className="text-sm text-muted-foreground">{assistanceNeeds}</p>
          </div>
        )}

        {specialCare && (
          <div className="rounded-md border p-3 bg-background">
            <div className="flex items-center mb-2">
              <Clipboard className="h-4 w-4 mr-2 text-purple-500" />
              <h4 className="font-medium">Special Care</h4>
            </div>
            <p className="text-sm text-muted-foreground">{specialCare}</p>
          </div>
        )}

        {cognitiveNotes && (
          <div className="rounded-md border p-3 bg-background">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2 text-amber-500" />
              <h4 className="font-medium">Cognitive Support</h4>
            </div>
            <p className="text-sm text-muted-foreground">{cognitiveNotes}</p>
          </div>
        )}

        {additionalNotes && (
          <div className="rounded-md border p-3 bg-background">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-2 text-green-500" />
              <h4 className="font-medium">Additional Notes</h4>
            </div>
            <p className="text-sm text-muted-foreground">{additionalNotes}</p>
          </div>
        )}
      </div>
    );
  };

  // Extract schedule coverage information
  const getScheduleCoverage = () => {
    const { metadata } = carePlan;
    if (!metadata) return null;
    
    const scheduleItems = [];
    
    // Check weekday coverage
    if (metadata.weekdayCoverage && metadata.weekdayCoverage !== 'none') {
      scheduleItems.push(`Weekdays: ${metadata.weekdayCoverage}`);
    }
    
    // Check weekend coverage
    if (metadata.weekendCoverage === 'yes') {
      scheduleItems.push(`Weekends: 6AM-6PM`);
    }
    
    // Check custom shifts
    if (metadata.customShifts && metadata.customShifts.length > 0) {
      metadata.customShifts.forEach(shift => {
        const days = shift.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
        scheduleItems.push(`${days}: ${shift.startTime}-${shift.endTime}`);
      });
    }
    
    return scheduleItems;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Care Plan Details</CardTitle>
          <CardDescription>
            Information about this care plan
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Plan Type</h3>
            <p className="font-medium">{getPlanTypeDisplay(carePlan)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Created On</h3>
            <p className="font-medium">{new Date(carePlan.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
            <p className="font-medium">{new Date(carePlan.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {getScheduleCoverage()?.length > 0 && (
          <div>
            <Separator className="my-4" />
            <h3 className="text-sm font-medium mb-3">Schedule Coverage</h3>
            <div className="space-y-2">
              {getScheduleCoverage()?.map((item, index) => (
                <div key={index} className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {carePlan.metadata?.additionalShifts && (
          <div className="mt-2">
            <h3 className="text-sm font-medium mb-2">Additional Shifts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {carePlan.metadata.additionalShifts.weekdayEvening4pmTo6am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (4PM-6AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekdayEvening4pmTo8am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (4PM-8AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekdayEvening6pmTo6am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (6PM-6AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekdayEvening6pmTo8am && (
                <Badge variant="outline" className="justify-start">Weekday Evening (6PM-8AM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekday8amTo4pm && (
                <Badge variant="outline" className="justify-start">Weekday (8AM-4PM)</Badge>
              )}
              {carePlan.metadata.additionalShifts.weekday8amTo6pm && (
                <Badge variant="outline" className="justify-start">Weekday (8AM-6PM)</Badge>
              )}
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3">Care Details</h3>
          {renderFormattedDescription()}
        </div>
      </CardContent>
    </Card>
  );
};
