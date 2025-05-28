import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Home, Car, Phone, Sparkles } from "lucide-react";
import { CareNeedsFormData } from "./types";

interface OtherSectionsComponentProps {
  formData: CareNeedsFormData;
  updateFormData: (field: string, value: any) => void;
}

export const OtherSectionsComponent = ({ formData, updateFormData }: OtherSectionsComponentProps) => {
  return (
    <>
      {/* Medical & Special Conditions */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            ❤️ Medical & Special Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diagnosed_conditions">Diagnosed conditions:</Label>
            <Textarea
              id="diagnosed_conditions"
              value={formData.diagnosed_conditions}
              onChange={(e) => updateFormData('diagnosed_conditions', e.target.value)}
              placeholder="List any diagnosed medical conditions..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="chronic_illness_type">Chronic Illness (please specify type if known):</Label>
            <Input
              id="chronic_illness_type"
              value={formData.chronic_illness_type}
              onChange={(e) => updateFormData('chronic_illness_type', e.target.value)}
              placeholder="e.g., Diabetes, Heart Disease, COPD"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'vitals_check', label: 'Blood pressure or glucose checks' },
              { key: 'equipment_use', label: 'Use of medical equipment (e.g. walker, nebulizer)' },
              { key: 'fall_monitoring', label: 'Fall risk monitoring' }
            ].map(item => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                  onCheckedChange={(checked) => updateFormData(item.key, checked)}
                />
                <Label htmlFor={item.key}>{item.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Housekeeping & Meals */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-green-500" />
            🧽 Housekeeping & Meals
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'tidy_room', label: 'Light tidying in care area' },
            { key: 'laundry_support', label: 'Laundry support' },
            { key: 'meal_prep', label: 'Meal prep (breakfast / lunch / snacks)' },
            { key: 'grocery_runs', label: 'Grocery pickup or errand help' }
          ].map(item => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                onCheckedChange={(checked) => updateFormData(item.key, checked)}
              />
              <Label htmlFor={item.key}>{item.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transportation */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-orange-500" />
            🛣️ Transportation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'escort_to_appointments', label: 'Escort to appointments' },
            { key: 'fresh_air_walks', label: 'Short walks or fresh air breaks' }
          ].map(item => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={formData[item.key as keyof CareNeedsFormData] as boolean}
                onCheckedChange={(checked) => updateFormData(item.key, checked)}
              />
              <Label htmlFor={item.key}>{item.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-yellow-500" />
            👩‍⚕️ Emergency Protocols
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">Emergency Contact Name *</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => updateFormData('emergency_contact_name', e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone *</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => updateFormData('emergency_contact_phone', e.target.value)}
                placeholder="Phone number"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
            <Input
              id="emergency_contact_relationship"
              value={formData.emergency_contact_relationship}
              onChange={(e) => updateFormData('emergency_contact_relationship', e.target.value)}
              placeholder="e.g., Brother, Sister, Spouse"
              required
            />
          </div>
          <div>
            <Label htmlFor="known_allergies">Known allergies or emergencies:</Label>
            <Textarea
              id="known_allergies"
              value={formData.known_allergies}
              onChange={(e) => updateFormData('known_allergies', e.target.value)}
              placeholder="List any allergies, medical emergencies to watch for..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="emergency_plan">Plan if symptoms worsen:</Label>
            <Textarea
              id="emergency_plan"
              value={formData.emergency_plan}
              onChange={(e) => updateFormData('emergency_plan', e.target.value)}
              placeholder="What should the caregiver do if symptoms worsen..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-teal-500" />
            💬 Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="communication_method">Best way to update caregiver/family:</Label>
            <Select value={formData.communication_method} onValueChange={(value) => updateFormData('communication_method', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text message</SelectItem>
                <SelectItem value="phone">Phone calls</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="daily_report_required"
              checked={formData.daily_report_required}
              onCheckedChange={(checked) => updateFormData('daily_report_required', checked)}
            />
            <Label htmlFor="daily_report_required">Daily care notes needed?</Label>
          </div>
          <div>
            <Label htmlFor="checkin_preference">Photo check-ins or verbal reports preferred?</Label>
            <Select value={formData.checkin_preference} onValueChange={(value) => updateFormData('checkin_preference', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="written">Written</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Preferences */}
      <Card className="border-l-4 border-l-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            ✨ Extra Notes / Cultural Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cultural_preferences">Religious observances, dietary restrictions, personality preferences, etc.</Label>
            <Textarea
              id="cultural_preferences"
              value={formData.cultural_preferences}
              onChange={(e) => updateFormData('cultural_preferences', e.target.value)}
              placeholder="Any religious observances, dietary restrictions, personality preferences, etc."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => updateFormData('additional_notes', e.target.value)}
              placeholder="Any other important information about care preferences..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
