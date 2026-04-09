
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Send, ClipboardCheck, FileText, BookOpen, ExternalLink } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCurrentAssignments } from '@/hooks/useCurrentAssignments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CHECKLIST_SECTIONS } from './checklist/checklistSections';
import { ChecklistSectionCard } from './checklist/ChecklistSectionCard';

export const DailyChecklist = () => {
  const { user } = useAuth();
  const { assignments } = useCurrentAssignments();
  const [clientName, setClientName] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);

  // Deduplicate family names from assignments
  const uniqueFamilies = useMemo(() => {
    return Array.from(
      new Map(assignments.map(a => [a.familyId, { id: a.familyId, name: a.familyName, carePlanId: a.carePlanId }])).entries()
    ).map(([, val]) => val);
  }, [assignments]);

  // Find selected assignment details
  const selectedAssignment = useMemo(() => {
    if (!clientName || clientName === '__other__') return null;
    return assignments.find(a => a.familyName === clientName) || null;
  }, [clientName, assignments]);

  const selectedFamilyId = selectedAssignment?.familyId;
  const selectedCarePlanId = selectedAssignment?.carePlanId;

  const resolvedClientName = clientName === '__other__' ? customClientName : clientName;

  // Fetch shifts when client or date changes
  useEffect(() => {
    if (!user?.id || !selectedFamilyId) {
      setAvailableShifts([]);
      return;
    }

    const fetchShifts = async () => {
      const { data, error } = await supabase
        .from('care_shifts')
        .select('id, title, start_time, end_time, status')
        .eq('caregiver_id', user.id)
        .eq('family_id', selectedFamilyId)
        .order('start_time', { ascending: true });

      if (!error && data) {
        setAvailableShifts(data);
      }
    };

    fetchShifts();
  }, [user?.id, selectedFamilyId, shiftDate]);

  // Auto-populate time in/out when shift selected
  useEffect(() => {
    if (!selectedShiftId || selectedShiftId === '__other__') return;
    const shift = availableShifts.find(s => s.id === selectedShiftId);
    if (shift) {
      try {
        const startDate = new Date(shift.start_time);
        const endDate = new Date(shift.end_time);
        setTimeIn(startDate.toTimeString().slice(0, 5));
        setTimeOut(endDate.toTimeString().slice(0, 5));
      } catch {}
    }
  }, [selectedShiftId, availableShifts]);

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isChecked = (sectionIdx: number, itemIdx: number) => {
    return checkedItems[`${sectionIdx}-${itemIdx}`] || false;
  };

  // Select all for a section
  const toggleSection = (sectionIdx: number) => {
    const section = CHECKLIST_SECTIONS[sectionIdx];
    const allChecked = section.items.every((_, iIdx) => isChecked(sectionIdx, iIdx));
    setCheckedItems(prev => {
      const updated = { ...prev };
      section.items.forEach((_, iIdx) => {
        updated[`${sectionIdx}-${iIdx}`] = !allChecked;
      });
      return updated;
    });
  };

  // Select all for entire day
  const toggleAll = () => {
    const allChecked = totalItems === completedItems && totalItems > 0;
    setCheckedItems(() => {
      const updated: Record<string, boolean> = {};
      CHECKLIST_SECTIONS.forEach((section, sIdx) => {
        section.items.forEach((_, iIdx) => {
          updated[`${sIdx}-${iIdx}`] = !allChecked;
        });
      });
      return updated;
    });
  };

  const totalItems = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allChecked = totalItems === completedItems && totalItems > 0;

  const getShiftLabel = () => {
    if (selectedShiftId === '__other__') return 'Ad-hoc Shift';
    const shift = availableShifts.find(s => s.id === selectedShiftId);
    return shift?.title || 'N/A';
  };

  const handleSave = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to save your daily log');
      return false;
    }
    if (!resolvedClientName) {
      toast.error('Please select a client');
      return false;
    }
    if (!selectedShiftId) {
      toast.error('Please select a shift');
      return false;
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

      const shiftType = selectedShiftId === '__other__' ? 'other' : 'scheduled';

      const { error } = await supabase.from('daily_care_logs').insert({
        professional_id: user.id,
        client_name: resolvedClientName || null,
        shift_date: shiftDate,
        shift_type: shiftType as any,
        checklist_data: checklistData,
        notes: notes || null,
        time_in: timeIn || null,
        time_out: timeOut || null,
      });

      if (error) throw error;
      toast.success('Daily care log saved successfully!');
      return true;
    } catch (err: any) {
      console.error('Error saving daily log:', err);
      toast.error(err.message || 'Failed to save daily log');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const buildWhatsAppSummary = () => {
    let summary = `📋 *SHIFT HANDOFF REPORT*\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━\n`;
    summary += `👤 Nurse: ${user?.user_metadata?.full_name || 'N/A'}\n`;
    summary += `🏠 Client: ${resolvedClientName || 'N/A'}\n`;
    summary += `📅 Date: ${shiftDate}\n`;
    summary += `⏰ Shift: ${getShiftLabel()} (${timeIn || '?'} – ${timeOut || '?'})\n`;
    summary += `✅ Completed: ${completedItems}/${totalItems} tasks (${progressPercent}%)\n\n`;

    CHECKLIST_SECTIONS.forEach((section, sIdx) => {
      const sectionCompleted = section.items.filter((_, iIdx) => isChecked(sIdx, iIdx)).length;
      const sectionTotal = section.items.length;
      const sectionDone = sectionCompleted === sectionTotal;
      summary += `${section.title} (${sectionCompleted}/${sectionTotal}) ${sectionDone ? '✅' : ''}\n`;
      section.items.forEach((item, iIdx) => {
        summary += `  ${isChecked(sIdx, iIdx) ? '✅' : '❌'} ${item}\n`;
      });
      summary += '\n';
    });

    // Items needing attention
    const incompleteItems: string[] = [];
    CHECKLIST_SECTIONS.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        if (!isChecked(sIdx, iIdx)) incompleteItems.push(item);
      });
    });

    if (incompleteItems.length > 0) {
      summary += `⚠️ *Items Needing Attention:*\n`;
      incompleteItems.forEach(item => {
        summary += `  - ${item}\n`;
      });
      summary += '\n';
    }

    if (notes) {
      summary += `📝 *Notes for Next Nurse:*\n${notes}\n\n`;
    }

    summary += `━━━━━━━━━━━━━━━━━━━━━\nLogged via Tavara Care`;
    return summary;
  };

  const handleSendWhatsApp = () => {
    const summary = buildWhatsAppSummary();
    const encoded = encodeURIComponent(summary);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleSaveAndSend = async () => {
    const saved = await handleSave();
    if (saved) {
      handleSendWhatsApp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Daily Care Checklist</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete and document your shift tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-master"
                  checked={allChecked}
                  onCheckedChange={toggleAll}
                />
                <Label htmlFor="select-all-master" className="text-sm font-medium cursor-pointer">
                  Select All
                </Label>
              </div>
              <Badge variant={progressPercent === 100 ? 'default' : 'secondary'} className="text-sm">
                {completedItems}/{totalItems} ({progressPercent}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Links to PDFs */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href="https://tavaracare.lovable.app/documents/Tavara_Nurse_Handbook.pdf" target="_blank" rel="noopener noreferrer" download="Tavara_Nurse_Handbook.pdf">
            <BookOpen className="h-4 w-4" />
            View Nurse Handbook & SOP
          </a>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href="https://tavaracare.lovable.app/documents/Tavara_Daily_Checklist.pdf" target="_blank" rel="noopener noreferrer" download="Tavara_Daily_Checklist.pdf">
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
              <Label>Client Name</Label>
              <Select value={clientName} onValueChange={(val) => { setClientName(val); setSelectedShiftId(''); }}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {uniqueFamilies.map(f => (
                    <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                  ))}
                  <SelectItem value="__other__">✏️ Other (type name)</SelectItem>
                </SelectContent>
              </Select>
              {clientName === '__other__' && (
                <Input
                  placeholder="Enter client name"
                  value={customClientName}
                  onChange={e => setCustomClientName(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shiftDate">Date</Label>
              <Input id="shiftDate" type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  {availableShifts.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other__">✏️ Other (ad-hoc shift)</SelectItem>
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
        const allSectionChecked = sectionCompleted === section.items.length;
        return (
          <ChecklistSectionCard
            key={sIdx}
            section={section}
            sectionIdx={sIdx}
            sectionCompleted={sectionCompleted}
            allSectionChecked={allSectionChecked}
            isChecked={isChecked}
            toggleItem={toggleItem}
            toggleSection={toggleSection}
            carePlanId={selectedCarePlanId}
          />
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

      {/* Actions - Three Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => handleSave()} disabled={saving} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Daily Log'}
        </Button>
        <Button variant="secondary" onClick={handleSaveAndSend} disabled={saving} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save & Send via WhatsApp'}
        </Button>
        <Button variant="outline" onClick={handleSendWhatsApp} className="flex-1 gap-2">
          <Send className="h-4 w-4" />
          Send Summary via WhatsApp
        </Button>
      </div>
    </div>
  );
};
