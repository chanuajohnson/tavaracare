
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Send, ClipboardCheck, Clock, FileText, BookOpen } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChecklistSection {
  title: string;
  items: string[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    title: '🌅 Start of Shift',
    items: [
      'Greet and check in with client',
      'Review previous shift notes',
      'Check medication schedule',
      'Assess client mood and comfort',
      'Inspect home environment for safety',
      'Confirm emergency contacts are accessible'
    ]
  },
  {
    title: '🩺 Care Tasks',
    items: [
      'Assist with bathing/personal hygiene',
      'Assist with dressing and grooming',
      'Oral care completed',
      'Assist with toileting / incontinence care',
      'Administer medications (under supervision)'
    ]
  },
  {
    title: '💙 Emotional Support',
    items: [
      'Provide companionship and conversation',
      'Engage in mental stimulation activities',
      'Monitor mood and emotional wellbeing',
      'Encourage social interaction'
    ]
  },
  {
    title: '🏠 Home Tasks',
    items: [
      'Prepare nutritious meals',
      'Assist with feeding if needed',
      'Light housekeeping / tidy patient areas',
      'Laundry support'
    ]
  },
  {
    title: '📊 Monitoring',
    items: [
      'Take vital signs (BP, temp, pulse)',
      'Monitor mobility and fall risk',
      'Check for skin integrity / pressure areas'
    ]
  },
  {
    title: '📞 Communication',
    items: [
      'Update WhatsApp care group',
      'Communicate with family as needed',
      'Report any concerns to care coordinator'
    ]
  },
  {
    title: '📝 Documentation & Logging',
    items: [
      'Complete daily care log entry',
      'Document medication administration',
      'Note any behavioral changes',
      'Record meals and fluid intake',
      'Document any incidents or concerns'
    ]
  },
  {
    title: '🌙 End of Shift',
    items: [
      'Brief incoming nurse on client status',
      'Ensure client is comfortable and safe',
      'Update shift notes for next nurse',
      'Confirm next shift coverage'
    ]
  }
];

export const DailyChecklist = () => {
  const { user } = useAuth();
  const [clientName, setClientName] = useState('');
  const [shiftType, setShiftType] = useState<string>('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Track checked items as a flat map: "sectionIndex-itemIndex" -> boolean
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isChecked = (sectionIdx: number, itemIdx: number) => {
    return checkedItems[`${sectionIdx}-${itemIdx}`] || false;
  };

  const totalItems = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save your daily log');
      return;
    }
    if (!shiftType) {
      toast.error('Please select a shift type');
      return;
    }

    setSaving(true);
    try {
      const checklistData: Record<string, any> = {};
      CHECKLIST_SECTIONS.forEach((section, sIdx) => {
        checklistData[section.title] = section.items.map((item, iIdx) => ({
          task: item,
          completed: isChecked(sIdx, iIdx)
        }));
      });

      const { error } = await supabase.from('daily_care_logs').insert({
        professional_id: user.id,
        client_name: clientName || null,
        shift_date: shiftDate,
        shift_type: shiftType as 'morning' | 'afternoon' | 'night',
        checklist_data: checklistData,
        notes: notes || null,
        time_in: timeIn || null,
        time_out: timeOut || null,
      });

      if (error) throw error;
      toast.success('Daily care log saved successfully!');
    } catch (err: any) {
      console.error('Error saving daily log:', err);
      toast.error(err.message || 'Failed to save daily log');
    } finally {
      setSaving(false);
    }
  };

  const buildWhatsAppSummary = () => {
    let summary = `📋 *Shift Summary*\n`;
    summary += `👤 Nurse: ${user?.user_metadata?.full_name || 'N/A'}\n`;
    summary += `🏠 Client: ${clientName || 'N/A'}\n`;
    summary += `📅 Date: ${shiftDate}\n`;
    summary += `⏰ Shift: ${shiftType || 'N/A'} (${timeIn || '?'} – ${timeOut || '?'})\n`;
    summary += `✅ Completed: ${completedItems}/${totalItems} tasks (${progressPercent}%)\n\n`;

    CHECKLIST_SECTIONS.forEach((section, sIdx) => {
      const sectionCompleted = section.items.filter((_, iIdx) => isChecked(sIdx, iIdx)).length;
      if (sectionCompleted < section.items.length) {
        summary += `${section.title}\n`;
        section.items.forEach((item, iIdx) => {
          summary += `  ${isChecked(sIdx, iIdx) ? '✅' : '❌'} ${item}\n`;
        });
        summary += '\n';
      }
    });

    if (notes) {
      summary += `📝 *Notes:*\n${notes}\n`;
    }

    return summary;
  };

  const handleSendWhatsApp = () => {
    const summary = buildWhatsAppSummary();
    const encoded = encodeURIComponent(summary);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Daily Care Checklist</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete and document your shift tasks
                </p>
              </div>
            </div>
            <Badge variant={progressPercent === 100 ? 'default' : 'secondary'} className="text-sm">
              {completedItems}/{totalItems} ({progressPercent}%)
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Links to PDFs */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href="/documents/Tavara_Nurse_Handbook.pdf" target="_blank" rel="noopener noreferrer">
            <BookOpen className="h-4 w-4" />
            View Nurse Handbook & SOP
          </a>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href="/documents/Tavara_Daily_Checklist.pdf" target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4" />
            View Checklist PDF
          </a>
        </Button>
      </div>

      {/* Shift Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" placeholder="Client name" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shiftDate">Date</Label>
              <Input id="shiftDate" type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select value={shiftType} onValueChange={setShiftType}>
                <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">☀️ Morning</SelectItem>
                  <SelectItem value="afternoon">🌤️ Afternoon</SelectItem>
                  <SelectItem value="night">🌙 Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="timeIn">Time In</Label>
                <Input id="timeIn" type="time" value={timeIn} onChange={e => setTimeIn(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeOut">Time Out</Label>
                <Input id="timeOut" type="time" value={timeOut} onChange={e => setTimeOut(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      {CHECKLIST_SECTIONS.map((section, sIdx) => {
        const sectionCompleted = section.items.filter((_, iIdx) => isChecked(sIdx, iIdx)).length;
        return (
          <Card key={sIdx}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <Badge variant={sectionCompleted === section.items.length ? 'default' : 'outline'} className="text-xs">
                  {sectionCompleted}/{section.items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-center gap-3 py-1">
                  <Checkbox
                    id={`check-${sIdx}-${iIdx}`}
                    checked={isChecked(sIdx, iIdx)}
                    onCheckedChange={() => toggleItem(sIdx, iIdx)}
                  />
                  <Label
                    htmlFor={`check-${sIdx}-${iIdx}`}
                    className={`font-normal cursor-pointer ${isChecked(sIdx, iIdx) ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📝 Notes & Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any observations, concerns, or notes for the next nurse..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Daily Log'}
        </Button>
        <Button variant="outline" onClick={handleSendWhatsApp} className="flex-1 gap-2">
          <Send className="h-4 w-4" />
          Send Shift Summary via WhatsApp
        </Button>
      </div>
    </div>
  );
};
