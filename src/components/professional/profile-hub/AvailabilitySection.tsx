
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface AvailabilitySectionProps {
  selectedAvailability: string[];
  setIsAvailabilityModalOpen: (open: boolean) => void;
}

export function AvailabilitySection({ selectedAvailability, setIsAvailabilityModalOpen }: AvailabilitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedAvailability && selectedAvailability.length > 0 ? (
          <div className="space-y-2">
            {selectedAvailability.map((availability, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>{availability}</span>
              </div>
            ))}
            <div className="pt-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsAvailabilityModalOpen(true)}
              >
                Update Availability
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No availability set</h3>
            <p className="text-gray-500 mb-4">
              Let clients know when you're available to work
            </p>
            <Button onClick={() => setIsAvailabilityModalOpen(true)}>
              Set Availability
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
