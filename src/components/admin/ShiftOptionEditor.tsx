
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

interface ShiftOptionEditorProps {
  shift?: any;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const ShiftOptionEditor: React.FC<ShiftOptionEditorProps> = ({
  shift,
  isEditing,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    emoji: '⏰',
    dayPattern: '',
    timeStart: '08:00',
    timeEnd: '16:00',
    description: '',
    category: 'weekday',
    isSpecial: false
  });

  const [previewTimeRange, setPreviewTimeRange] = useState({ start: '08:00', end: '16:00' });
  const [isCrossDay, setIsCrossDay] = useState(false);

  useEffect(() => {
    if (isEditing && shift) {
      // Parse existing shift data
      const parts = shift.label.split(' ');
      const emoji = parts[0] || '⏰';
      
      setFormData({
        value: shift.value,
        label: shift.label,
        emoji: emoji,
        dayPattern: shift.value.includes('mon_fri') ? 'Monday – Friday' : 
                   shift.value.includes('sat_sun') ? 'Saturday – Sunday' : 'Custom',
        timeStart: '08:00', // Would be parsed from existing data
        timeEnd: '16:00',   // Would be parsed from existing data
        description: '', // Would be fetched from getShiftDescription
        category: shift.value.startsWith('mon_fri') ? 'weekday' :
                 shift.value.startsWith('sat_sun') ? 'weekend' :
                 shift.value.includes('evening') ? 'evening' : 'special',
        isSpecial: ['flexible', 'live_in_care', '24_7_care', 'around_clock_shifts', 'other'].includes(shift.value)
      });
    }
  }, [shift, isEditing]);

  useEffect(() => {
    // Update preview when times change
    const startTime = formData.timeStart;
    const endTime = formData.timeEnd;
    setPreviewTimeRange({ start: startTime, end: endTime });
    
    // Check if it's a cross-day shift
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    setIsCrossDay(endHour < startHour);
  }, [formData.timeStart, formData.timeEnd]);

  const emojiOptions = [
    '⏰', '☀️', '🕕', '🌞', '🌙', '🌆', '⏳', '🏡', '🕐', '🌅', '✏️'
  ];

  const categoryOptions = [
    { value: 'weekday', label: 'Weekday Shifts' },
    { value: 'weekend', label: 'Weekend Shifts' },
    { value: 'evening', label: 'Evening Shifts' },
    { value: 'special', label: 'Special Types' }
  ];

  const generateShiftValue = () => {
    if (formData.isSpecial) {
      return formData.value || 'custom_shift';
    }
    
    const dayPrefix = formData.category === 'weekend' ? 'sat_sun' : 'mon_fri';
    const timePattern = `${formData.timeStart.replace(':', '')}${formData.category === 'evening' ? 'pm' : 'am'}_${formData.timeEnd.replace(':', '')}${isCrossDay ? 'am' : 'pm'}`;
    
    if (formData.category === 'evening') {
      return `${dayPrefix.split('_')[0]}_evening_${timePattern}`;
    }
    
    return `${dayPrefix}_${timePattern}`;
  };

  const handleSave = () => {
    if (!formData.label.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real implementation, this would update the actual STANDARDIZED_SHIFT_OPTIONS
    // and trigger regeneration of the time mapping functions
    toast.info('Note: This is a preview - actual implementation would update the shift configuration files');
    onSave();
  };

  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emoji">Emoji</Label>
          <Select value={formData.emoji} onValueChange={(value) => setFormData({...formData, emoji: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {emojiOptions.map((emoji) => (
                <SelectItem key={emoji} value={emoji}>{emoji}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Display Label *</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({...formData, label: e.target.value})}
          placeholder="e.g., 🌞 Saturday – Sunday, 8 AM – 6 PM (Main Weekend daytime coverage)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeStart">Start Time</Label>
          <Input
            id="timeStart"
            type="time"
            value={formData.timeStart}
            onChange={(e) => setFormData({...formData, timeStart: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeEnd">End Time</Label>
          <Input
            id="timeEnd"
            type="time"
            value={formData.timeEnd}
            onChange={(e) => setFormData({...formData, timeEnd: e.target.value})}
          />
        </div>
      </div>

      {isCrossDay && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Cross-day shift detected</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              This shift spans overnight (end time is earlier than start time).
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe this shift type and when it would be used"
          rows={3}
        />
      </div>

      {/* Preview Section */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </CardTitle>
          <CardDescription>
            How this shift will appear across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <strong>Generated Value:</strong> <code className="bg-white px-2 py-1 rounded text-sm">{generateShiftValue()}</code>
          </div>
          <div>
            <strong>Time Range:</strong> {previewTimeRange.start} - {previewTimeRange.end}
            {isCrossDay && <Badge variant="secondary" className="ml-2">Cross-day</Badge>}
          </div>
          <div>
            <strong>Category:</strong> <Badge variant="outline">{formData.category}</Badge>
          </div>
          <div className="p-3 bg-white rounded border">
            <div className="text-sm font-medium">{formData.label || 'Enter label above'}</div>
            <div className="text-xs text-muted-foreground mt-1">{formData.description || 'Enter description above'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800 mb-1">
                {isEditing ? 'Editing Impact' : 'Creation Impact'}
              </h4>
              <p className="text-sm text-orange-700">
                {isEditing 
                  ? 'Changes will update this shift option everywhere it appears in the system.'
                  : 'This new shift will become available in family registration, professional registration, and care plan creation.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {isEditing ? 'Update Shift' : 'Create Shift'}
        </Button>
      </div>
    </div>
  );
};
