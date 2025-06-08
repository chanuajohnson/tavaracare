
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Video, Home, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiverName?: string;
  onVisitScheduled?: () => void;
}

export const ScheduleVisitModal = ({ 
  open, 
  onOpenChange, 
  caregiverName = "your care coordinator",
  onVisitScheduled
}: ScheduleVisitModalProps) => {
  const [visitType, setVisitType] = useState<'virtual' | 'in-person'>('virtual');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const availableDates = [
    { date: '2024-01-15', display: 'Mon, Jan 15' },
    { date: '2024-01-16', display: 'Tue, Jan 16' },
    { date: '2024-01-17', display: 'Wed, Jan 17' },
    { date: '2024-01-18', display: 'Thu, Jan 18' },
  ];

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      setIsConfirmed(true);
      // Call the callback to update journey progress
      if (onVisitScheduled) {
        onVisitScheduled();
      }
      // Close modal after a short delay to show confirmation
      setTimeout(() => {
        onOpenChange(false);
        setIsConfirmed(false);
      }, 1500);
    }
  };

  const resetModal = () => {
    setVisitType('virtual');
    setSelectedDate('');
    setSelectedTime('');
    setIsConfirmed(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  if (isConfirmed) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Visit Scheduled Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your {visitType === 'virtual' ? 'virtual' : 'in-person'} visit with {caregiverName} is confirmed for {availableDates.find(d => d.date === selectedDate)?.display} at {selectedTime}.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive a confirmation email shortly with all the details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Your Path Forward</DialogTitle>
          <p className="text-muted-foreground">
            Schedule a visit with {caregiverName} to discuss your care needs and unlock access to caregiver profiles.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Visit Type Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Visit Type</h3>
            <RadioGroup value={visitType} onValueChange={(value: 'virtual' | 'in-person') => setVisitType(value)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="virtual" id="virtual" />
                  <Label htmlFor="virtual" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Video className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Schedule Virtual Visit</div>
                        <div className="text-sm text-gray-500">30-minute video call consultation</div>
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="in-person" id="in-person" />
                  <Label htmlFor="in-person" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Home className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">Schedule Home Visit</div>
                        <div className="text-sm text-gray-500">In-person home assessment</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Visit Benefits */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">What's included in your visit:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Personalized care assessment</li>
              <li>• Unlock All Matches access to detailed caregiver profiles</li>
              <li>• Custom care plan recommendations</li>
              <li>• Direct introduction to matched caregivers</li>
            </ul>
          </div>

          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableDates.map((dateOption) => (
                <Button
                  key={dateOption.date}
                  variant={selectedDate === dateOption.date ? "default" : "outline"}
                  className="p-3 h-auto flex flex-col items-center"
                  onClick={() => setSelectedDate(dateOption.date)}
                >
                  <Calendar className="h-4 w-4 mb-1" />
                  <span className="text-xs">{dateOption.display}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Time</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="p-2 h-auto flex items-center justify-center"
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-xs">{time}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {selectedDate && selectedTime && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Visit Summary:</h4>
              <div className="text-sm text-green-800">
                <p><strong>Type:</strong> {visitType === 'virtual' ? 'Virtual Visit' : 'In-Person Home Visit'}</p>
                <p><strong>Date:</strong> {availableDates.find(d => d.date === selectedDate)?.display}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>With:</strong> {caregiverName}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
