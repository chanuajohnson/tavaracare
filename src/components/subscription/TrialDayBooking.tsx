
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Clock, Video, Users, ArrowRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { UnifiedPaymentFlow } from './UnifiedPaymentFlow';

interface TrialDayBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrialConfirmed?: (trialDetails: {
    date: string;
    type: 'video' | 'in-person';
    paymentId: string;
  }) => void;
}

export const TrialDayBooking: React.FC<TrialDayBookingProps> = ({
  open,
  onOpenChange,
  onTrialConfirmed
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [trialType, setTrialType] = useState<'video' | 'in-person'>('video');
  const [showPayment, setShowPayment] = useState(false);

  const handleContinueToPayment = () => {
    if (!selectedDate) return;
    setShowPayment(true);
  };

  const handleTrialPaymentSuccess = (transactionId: string) => {
    if (selectedDate && onTrialConfirmed) {
      onTrialConfirmed({
        date: selectedDate.toISOString(),
        type: trialType,
        paymentId: transactionId
      });
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setTrialType('video');
    setShowPayment(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  if (showPayment) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Trial Booking</DialogTitle>
          </DialogHeader>
          <UnifiedPaymentFlow
            paymentType="trial"
            trialDate={selectedDate?.toISOString()}
            trialType={trialType}
            onTrialPaymentSuccess={handleTrialPaymentSuccess}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Book Your Trial Day
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trial Type Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Choose Your Trial Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${trialType === 'video' ? 'ring-2 ring-primary border-primary' : 'hover:border-gray-300'}`}
                onClick={() => setTrialType('video')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Video Call</div>
                      <div className="text-sm text-gray-600">$150 TTD</div>
                      <div className="text-xs text-gray-500">($22.15 USD)</div>
                    </div>
                    {trialType === 'video' && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${trialType === 'in-person' ? 'ring-2 ring-primary border-primary' : 'hover:border-gray-300'}`}
                onClick={() => setTrialType('in-person')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">In-Person</div>
                      <div className="text-sm text-gray-600">$320 TTD</div>
                      <div className="text-xs text-gray-500">($47.28 USD)</div>
                    </div>
                    {trialType === 'in-person' && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Select Trial Date</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">What's Included in Your Trial</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Meet your matched caregiver</li>
              <li>• Full day of personalized care</li>
              <li>• No long-term commitment</li>
              <li>• Trial fee credited toward subscription</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleContinueToPayment}
              disabled={!selectedDate}
              className="flex-1"
            >
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
