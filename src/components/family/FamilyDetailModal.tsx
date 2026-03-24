import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UrgentBadge } from "@/components/spotlight/UrgentBadge";
import { MapPin, Clock, Stethoscope, Award, MessageCircle, Heart, Briefcase } from "lucide-react";

interface FamilyDetailData {
  id: string;
  full_name: string;
  location: string | null;
  care_types: string[] | null;
  care_urgency: string | null;
  care_schedule: string | null;
  diagnosed_conditions: string | null;
  chronic_illness_type: string | null;
}

interface FamilyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family: FamilyDetailData | null;
  onWhatsAppInquiry: (family: FamilyDetailData) => void;
}

const CARE_TYPE_LABELS: Record<string, string> = {
  personal_care: "🧼 Personal Care",
  medication_management: "💊 Medication Management",
  mobility_assistance: "🚶 Mobility Assistance",
  meal_preparation: "🍲 Meal Preparation",
  housekeeping: "🧹 Light Housekeeping",
  transportation: "🚗 Transportation",
  companionship: "👥 Companionship",
  specialized_care: "🏥 Specialized Care",
};

const SCHEDULE_LABELS: Record<string, string> = {
  mornings: "Morning Care",
  afternoons: "Afternoon Care",
  evenings: "Evening Care",
  overnight: "Overnight Care",
  full_time: "Full-time Care",
  flexible: "Flexible Schedule",
  mon_fri_8am_4pm: "Monday–Friday, 8AM–4PM",
  mon_fri_8am_6pm: "Monday–Friday, 8AM–6PM",
  mon_fri_6am_6pm: "Monday–Friday, 6AM–6PM",
  sat_sun_6am_6pm: "Saturday–Sunday, 6AM–6PM",
  sat_sun_8am_4pm: "Saturday–Sunday, 8AM–4PM",
  weekday_evening_4pm_6am: "Weekday Evening, 4PM–6AM",
  weekday_evening_4pm_8am: "Weekday Evening, 4PM–8AM",
  weekday_evening_5pm_5am: "Weekday Evening, 5PM–5AM",
  weekday_evening_5pm_8am: "Weekday Evening, 5PM–8AM",
  weekday_evening_6pm_6am: "Weekday Evening, 6PM–6AM",
  weekday_evening_6pm_8am: "Weekday Evening, 6PM–8AM",
  weekend_evening_4pm_6am: "Weekend Evening, 4PM–6AM",
  weekend_evening_6pm_6am: "Weekend Evening, 6PM–6AM",
  live_in_care: "Live-In Care",
  "24_7_care": "24/7 Care",
  around_clock_shifts: "Around-the-Clock Shifts",
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return "F";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "F";
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getGeneralArea = (location: string | null): string => {
  if (!location) return "Trinidad & Tobago";
  const parts = location.split(',').map(p => p.trim());
  return parts.length > 2 ? parts.slice(-2).join(', ') : location;
};

export const FamilyDetailModal = ({ open, onOpenChange, family, onWhatsAppInquiry }: FamilyDetailModalProps) => {
  if (!family) return null;

  const initials = getInitials(family.full_name);
  const area = getGeneralArea(family.location);
  const urgencyLevel = family.care_urgency === "immediate" ? "high" as const : "medium" as const;

  const scheduleEntries = family.care_schedule
    ? family.care_schedule.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 -mx-6 -mt-6 px-6 pt-6 pb-12 rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <UrgentBadge
                urgencyLevel={urgencyLevel}
                label={family.care_urgency === "immediate" ? "Immediate Need" : "Seeking Care"}
              />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-primary" />
                Verified Family
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Avatar overlapping header */}
        <div className="relative -mt-8 mb-2">
          <Avatar className="h-20 w-20 border-4 border-background shadow-md">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <DialogTitle className="text-xl font-bold">Family in {area}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Seeking compassionate, reliable care support
        </DialogDescription>

        {/* Location */}
        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{area}</span>
          </div>

          {/* Schedule section */}
          {scheduleEntries.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Care Schedule
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {scheduleEntries.map((entry) => (
                  <Badge key={entry} variant="secondary" className="text-xs font-normal">
                    {SCHEDULE_LABELS[entry] || entry}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Care types */}
          {family.care_types && family.care_types.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                Care Needs
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {family.care_types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs font-normal">
                    {CARE_TYPE_LABELS[type] || type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Medical info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-primary" />
              Medical Information
            </h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Diagnosed Conditions:</span>{" "}
                <span className="text-foreground">
                  {family.diagnosed_conditions || "No diagnosed conditions specified"}
                </span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Chronic Illness:</span>{" "}
                <span className="text-foreground">
                  {family.chronic_illness_type || "No chronic illness specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Seeking care now
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-destructive" />
              Verified Family
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              onWhatsAppInquiry(family);
              onOpenChange(false);
            }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Inquire via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
