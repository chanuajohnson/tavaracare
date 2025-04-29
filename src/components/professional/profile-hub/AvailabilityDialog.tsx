
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock, Mail, Moon, Phone, Sun } from "lucide-react";
import { useState } from "react";

interface AvailabilityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAvailability: string[];
  onAvailabilityChange: (value: string[]) => void;
  saveAvailability: () => Promise<void>;
}

export function AvailabilityDialog({
  isOpen,
  onOpenChange,
  selectedAvailability,
  onAvailabilityChange,
  saveAvailability
}: AvailabilityDialogProps) {
  const [otherAvailability, setOtherAvailability] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Availability</DialogTitle>
          <DialogDescription>
            Choose when you're available to work. This helps families find the right care professional.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Shift Types</Label>
            <ToggleGroup 
              type="multiple" 
              className="flex flex-wrap justify-start gap-2"
              value={selectedAvailability}
              onValueChange={(value) => onAvailabilityChange(value)}
            >
              <ToggleGroupItem value="Weekday Mornings" className="gap-1">
                <Sun className="h-4 w-4" />
                <span>Weekday AM</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Weekday Afternoons" className="gap-1">
                <Sun className="h-4 w-4" />
                <span>Weekday PM</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Weekday Evenings" className="gap-1">
                <Moon className="h-4 w-4" />
                <span>Weekday Eve</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Weekend Mornings" className="gap-1">
                <Sun className="h-4 w-4" />
                <span>Weekend AM</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Weekend Afternoons" className="gap-1">
                <Sun className="h-4 w-4" />
                <span>Weekend PM</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Weekend Evenings" className="gap-1">
                <Moon className="h-4 w-4" />
                <span>Weekend Eve</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Overnight" className="gap-1">
                <Moon className="h-4 w-4" />
                <span>Overnight</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="24-Hour Care" className="gap-1">
                <Clock className="h-4 w-4" />
                <span>24-Hour</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="On-Call" className="gap-1">
                <Phone className="h-4 w-4" />
                <span>On-Call</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="other-availability">Other Availability</Label>
            <input
              id="other-availability"
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="e.g., Only available during summer months"
              value={otherAvailability}
              onChange={(e) => setOtherAvailability(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={saveAvailability}>Save Availability</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
