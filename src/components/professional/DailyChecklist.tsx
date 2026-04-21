import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PRODUCTION_BASE_URL } from '@/utils/urlConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Send, ClipboardCheck, FileText, BookOpen, ExternalLink, Pencil, Info, Heart, X, MessageSquare, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCurrentAssignments } from '@/hooks/useCurrentAssignments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CHECKLIST_SECTIONS } from './checklist/checklistSections';
import { ChecklistSectionCard } from './checklist/ChecklistSectionCard';
import { openCheckInWhatsApp } from '@/utils/whatsapp/checkInTemplate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'tavara_daily_checklist_draft';

interface DraftState {
  clientName: string;
  customClientName: string;
  selectedShiftId: string;
  shiftDate: string;
  timeIn: string;
  timeOut: string;
  notes: string;
  checkedItems: Record<string, boolean>;
  savedAt: string;
}

interface DailyChecklistProps {
  /** Pre-load an existing log by ID (from calendar view) */
  preloadLogId?: string;
  /** Pre-select client name */
  preloadClientName?: string;
  /** Pre-select date */
  preloadDate?: string;
}

export const DailyChecklist = ({ preloadLogId, preloadClientName, preloadDate }: DailyChecklistProps) => {
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
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Existing log editing state
  const [existingLogId, setExistingLogId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Family notes (from daily_care_log_feedback) for the active log
  const [familyNotes, setFamilyNotes] = useState<Array<{ id: string; comment: string; created_at: string; acknowledged_at: string | null }>>([]);
  const [ackingNote, setAckingNote] = useState<string | null>(null);

  // First-time onboarding info card visibility (per-user, persisted)
  const [showIntroCard, setShowIntroCard] = useState(false);

  // Check-in confirmation dialog state — opens after first save succeeds
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<{
    caregiverName: string;
    clientName: string;
    shiftLabel?: string;
    scheduledStart?: string;
    startedAtIso: string;
    completedItems: number;
    totalItems: number;
    displayTime: string;
    logId?: string;
  } | null>(null);
  // Caregiver-overridable arrival time (HH:mm). Defaults to login time.
  const [arrivalTimeOverride, setArrivalTimeOverride] = useState<string>('');
  const [arrivalError, setArrivalError] = useState<string>('');

  // Show intro card on first visit (per user)
  useEffect(() => {
    if (!user?.id) return;
    const seenKey = `tavara_checklist_intro_seen_${user.id}`;
    const seen = localStorage.getItem(seenKey);
    if (!seen) setShowIntroCard(true);
  }, [user?.id]);

  const dismissIntroCard = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(`tavara_checklist_intro_seen_${user.id}`, '1');
    }
    setShowIntroCard(false);
  }, [user?.id]);

  // Apply preload props
  useEffect(() => {
    if (preloadDate) setShiftDate(preloadDate);
    if (preloadClientName) setClientName(preloadClientName);
  }, [preloadDate, preloadClientName]);

  // Load draft from localStorage on mount (only if no preload)
  useEffect(() => {
    if (preloadLogId || preloadClientName) {
      setDraftLoaded(true);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft: DraftState = JSON.parse(raw);
        const today = new Date().toISOString().split('T')[0];
        if (draft.shiftDate === today || draft.savedAt?.startsWith(today)) {
          setClientName(draft.clientName || '');
          setCustomClientName(draft.customClientName || '');
          setSelectedShiftId(draft.selectedShiftId || '');
          setShiftDate(draft.shiftDate || today);
          setTimeIn(draft.timeIn || '');
          setTimeOut(draft.timeOut || '');
          setNotes(draft.notes || '');
          setCheckedItems(draft.checkedItems || {});
        }
      }
    } catch {}
    setDraftLoaded(true);
  }, [preloadLogId, preloadClientName]);

  // Save draft to localStorage on state changes (debounced)
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => {
      const draft: DraftState = {
        clientName,
        customClientName,
        selectedShiftId,
        shiftDate,
        timeIn,
        timeOut,
        notes,
        checkedItems,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 500);
    return () => clearTimeout(timer);
  }, [draftLoaded, clientName, customClientName, selectedShiftId, shiftDate, timeIn, timeOut, notes, checkedItems]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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

  // Restore checkedItems from JSONB checklist_data
  const restoreChecklistFromData = useCallback((checklistData: Record<string, any>) => {
    const restored: Record<string, boolean> = {};
    CHECKLIST_SECTIONS.forEach((section, sIdx) => {
      const saved = checklistData[section.title];
      if (saved && Array.isArray(saved)) {
        saved.forEach((item: any, iIdx: number) => {
          if (iIdx < section.items.length) {
            restored[`${sIdx}-${iIdx}`] = item.completed === true;
          }
        });
      }
    });
    return restored;
  }, []);

  // Fetch existing log when client + date changes
  useEffect(() => {
    if (!user?.id || !resolvedClientName || !shiftDate) {
      setExistingLogId(null);
      setIsEditMode(false);
      return;
    }

    const fetchExistingLog = async () => {
      setLoadingExisting(true);
      try {
        let query = supabase
          .from('daily_care_logs')
          .select('*')
          .eq('professional_id', user.id)
          .eq('shift_date', shiftDate);
        
        // Prefer matching by care_plan_id when available, fall back to client_name
        if (selectedCarePlanId) {
          query = query.eq('care_plan_id', selectedCarePlanId);
        } else {
          query = query.eq('client_name', resolvedClientName);
        }
        
        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const log = data[0];
          setExistingLogId(log.id);
          setIsEditMode(true);

          // Restore all fields from existing log
          if (log.checklist_data && typeof log.checklist_data === 'object') {
            const restored = restoreChecklistFromData(log.checklist_data as Record<string, any>);
            setCheckedItems(restored);
          }
          if (log.notes) setNotes(log.notes);
          if (log.time_in) setTimeIn(log.time_in);
          if (log.time_out) setTimeOut(log.time_out);
          // Don't override shift selection - keep what user selected
        } else {
          setExistingLogId(null);
          setIsEditMode(false);
        }
      } catch (err) {
        console.error('Error fetching existing log:', err);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingLog();
  }, [user?.id, resolvedClientName, shiftDate, restoreChecklistFromData]);

  // Load a specific log by ID (from calendar)
  useEffect(() => {
    if (!preloadLogId || !user?.id) return;

    const loadById = async () => {
      setLoadingExisting(true);
      try {
        const { data, error } = await supabase
          .from('daily_care_logs')
          .select('*')
          .eq('id', preloadLogId)
          .single();

        if (!error && data) {
          setExistingLogId(data.id);
          setIsEditMode(true);
          setShiftDate(data.shift_date);
          if (data.client_name) setClientName(data.client_name);
          if (data.notes) setNotes(data.notes);
          if (data.time_in) setTimeIn(data.time_in);
          if (data.time_out) setTimeOut(data.time_out);
          if (data.checklist_data && typeof data.checklist_data === 'object') {
            const restored = restoreChecklistFromData(data.checklist_data as Record<string, any>);
            setCheckedItems(restored);
          }
        }
      } catch (err) {
        console.error('Error loading log by ID:', err);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadById();
  }, [preloadLogId, user?.id, restoreChecklistFromData]);

  // Fetch family notes when an existing log is loaded
  useEffect(() => {
    if (!existingLogId) {
      setFamilyNotes([]);
      return;
    }
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('daily_care_log_feedback')
        .select('id, comment, created_at, acknowledged_at, author_role')
        .eq('log_id', existingLogId)
        .order('created_at', { ascending: true });
      const filtered = (data || [])
        .filter((fb: any) => fb.author_role === 'family' && !fb.comment.startsWith('__'))
        .map((fb: any) => ({
          id: fb.id,
          comment: fb.comment,
          created_at: fb.created_at,
          acknowledged_at: fb.acknowledged_at,
        }));
      setFamilyNotes(filtered);
    };
    fetchNotes();
  }, [existingLogId]);

  const handleAckFamilyNote = async (noteId: string) => {
    if (!user) return;
    setAckingNote(noteId);
    try {
      const { error } = await supabase
        .from('daily_care_log_feedback')
        .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: user.id })
        .eq('id', noteId);
      if (error) throw error;
      toast.success('Acknowledged');
      setFamilyNotes(prev => prev.map(n => n.id === noteId ? { ...n, acknowledged_at: new Date().toISOString() } : n));
    } catch (err: any) {
      toast.error(err.message || 'Failed to acknowledge');
    } finally {
      setAckingNote(null);
    }
  };

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
      const nowIso = new Date().toISOString();

      const logPayload: Record<string, any> = {
        professional_id: user.id,
        client_name: resolvedClientName || null,
        shift_date: shiftDate,
        shift_type: shiftType as any,
        checklist_data: checklistData,
        notes: notes || null,
        time_in: timeIn || null,
        time_out: timeOut || null,
        care_plan_id: selectedCarePlanId || null,
        family_id: selectedFamilyId || null,
        last_activity_at: nowIso,
      };

      if (existingLogId) {
        // Update existing log — only bump last_activity_at, never touch started_at
        const { error } = await supabase
          .from('daily_care_logs')
          .update(logPayload)
          .eq('id', existingLogId);
        if (error) throw error;
        clearDraft();
        toast.success('Daily care log updated successfully!');
      } else {
        // First save → stamp started_at, fire central WhatsApp check-in
        logPayload.started_at = nowIso;

        const { data, error } = await supabase
          .from('daily_care_logs')
          .insert(logPayload as any)
          .select('id, started_at')
          .single();
        if (error) throw error;
        if (data) {
          setExistingLogId(data.id);
          setIsEditMode(true);

          // Fire admin check-in WhatsApp via confirmation dialog (one-shot, only on first save).
          // We stage the payload + open a "You're checked in!" modal so the caregiver
          // understands the WhatsApp redirect that's about to happen and can opt-in.
          try {
            const shiftLabel =
              timeIn && timeOut ? `${timeIn} – ${timeOut}` : undefined;
            const startedAtIso = data.started_at || nowIso;
            const displayTime = new Date(startedAtIso).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
            setPendingCheckIn({
              caregiverName: user?.user_metadata?.full_name || 'Caregiver',
              clientName: resolvedClientName,
              shiftLabel,
              scheduledStart: timeIn || undefined,
              startedAtIso,
              completedItems,
              totalItems,
              displayTime,
            });
            setCheckInDialogOpen(true);
          } catch (waErr) {
            console.warn('[DailyChecklist] check-in WhatsApp staging failed:', waErr);
          }
        }
        clearDraft();
        toast.success('Daily care log saved — Tavara has recorded you on the job.');
      }
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
    const nurseName = user?.user_metadata?.full_name || 'N/A';
    let summary = `📋 *SHIFT HANDOFF*\n`;
    summary += `👤 ${nurseName} → 🏠 ${resolvedClientName || 'N/A'}\n`;
    summary += `📅 ${shiftDate} | ⏰ ${timeIn || '?'} – ${timeOut || '?'}\n`;
    summary += `✅ ${completedItems}/${totalItems} tasks completed (${progressPercent}%)\n`;

    // Only list incomplete items if any
    const incompleteItems: string[] = [];
    CHECKLIST_SECTIONS.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        if (!isChecked(sIdx, iIdx)) incompleteItems.push(item);
      });
    });

    if (incompleteItems.length > 0) {
      summary += `\n⚠️ *Needs attention:*\n`;
      incompleteItems.forEach(item => {
        summary += `• ${item}\n`;
      });
    }

    if (notes) {
      summary += `\n📝 *Notes:* ${notes}\n`;
    }

    // Deep link to care plan daily logs tab
    if (selectedCarePlanId) {
      summary += `\n🔗 View full log & care plan:\n${PRODUCTION_BASE_URL}/family/care-management/${selectedCarePlanId}?tab=daily-logs\n`;
    }

    summary += `\n— Tavara Care`;
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

  const saveButtonLabel = isEditMode
    ? (saving ? 'Updating...' : 'Update Daily Log')
    : (saving ? 'Saving...' : 'Save Daily Log');

  const saveAndSendLabel = isEditMode
    ? (saving ? 'Updating...' : 'Update & Send via WhatsApp')
    : (saving ? 'Saving...' : 'Save & Send via WhatsApp');

  return (
    <div className="space-y-6">
      {/* First-time onboarding info card — explains the WhatsApp redirect that's coming */}
      {showIntroCard && !isEditMode && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/60 relative">
          <button
            type="button"
            onClick={dismissIntroCard}
            className="absolute right-3 top-3 p-1 rounded-md text-blue-700/70 hover:text-blue-900 hover:bg-blue-100 transition-colors"
            aria-label="Dismiss introduction"
          >
            <X className="h-4 w-4" />
          </button>
          <CardContent className="pt-4 pb-4 flex items-start gap-3 pr-10">
            <Heart className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-900">
                💙 First time using your Daily Checklist?
              </p>
              <p className="text-sm text-blue-900/90 leading-relaxed">
                When you tick and save your first item, a WhatsApp message will pop up
                automatically — pre-filled and ready to send to Tavara. This is how we let
                your family and the Tavara team know you've arrived and started your shift
                safely.
              </p>
              <p className="text-sm text-blue-900/90">
                Just tap <strong>"Send"</strong> in WhatsApp — that's all you need to do.
              </p>
              <Button
                size="sm"
                onClick={dismissIntroCard}
                className="mt-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Got it, thanks!
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* On-the-job tip banner — shown only before first save */}
      {!isEditMode && (
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-900">
              <strong>Tip:</strong> tick your first item and save as soon as you arrive —
              that's how Tavara records you on the job. A check-in note will be sent to admin
              automatically the first time you save today's checklist.
            </p>
          </CardContent>
        </Card>
      )}

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
              {isEditMode && (
                <Badge variant="outline" className="gap-1 border-amber-400 text-amber-700 bg-amber-50">
                  <Pencil className="h-3 w-3" />
                  Editing existing log
                </Badge>
              )}
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
          <a href={`${PRODUCTION_BASE_URL}/documents/Tavara_Nurse_Handbook.pdf`} target="_blank" rel="noopener noreferrer" download="Tavara_Nurse_Handbook.pdf">
            <BookOpen className="h-4 w-4" />
            View Nurse Handbook & SOP
          </a>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={`${PRODUCTION_BASE_URL}/documents/Tavara_Daily_Checklist.pdf`} target="_blank" rel="noopener noreferrer" download="Tavara_Daily_Checklist.pdf">
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
          {loadingExisting && (
            <p className="text-xs text-muted-foreground mt-2 animate-pulse">Checking for existing log...</p>
          )}
        </CardContent>
      </Card>

      {/* Family notes banner — surfaces unacknowledged messages from the family on this log */}
      {familyNotes.filter(n => !n.acknowledged_at).length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-900">
              <MessageSquare className="h-5 w-5 text-amber-600" />
              New note{familyNotes.filter(n => !n.acknowledged_at).length > 1 ? 's' : ''} from family
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {familyNotes.filter(n => !n.acknowledged_at).map((note) => (
              <div key={note.id} className="flex items-start gap-3 p-3 bg-white/70 rounded-md border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-900 whitespace-pre-wrap break-words">{note.comment}</p>
                  <p className="text-xs text-amber-700/70 mt-1">
                    {new Date(note.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => handleAckFamilyNote(note.id)}
                  disabled={ackingNote === note.id}
                >
                  {ackingNote === note.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Acknowledge
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Acknowledged family notes — small confirmation chip list */}
      {familyNotes.filter(n => n.acknowledged_at).length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {familyNotes.filter(n => n.acknowledged_at).map((note) => (
            <Badge key={note.id} variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs font-normal">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Family note acknowledged
            </Badge>
          ))}
        </div>
      )}

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
          {saveButtonLabel}
        </Button>
        <Button variant="secondary" onClick={handleSaveAndSend} disabled={saving} className="flex-1 gap-2">
          <Save className="h-4 w-4" />
          {saveAndSendLabel}
        </Button>
        <Button variant="outline" onClick={handleSendWhatsApp} className="flex-1 gap-2">
          <Send className="h-4 w-4" />
          Send Summary via WhatsApp
        </Button>
      </div>

      {/* Check-in confirmation dialog — appears right after first save, before WA opens */}
      <Dialog
        open={checkInDialogOpen}
        onOpenChange={(open) => {
          setCheckInDialogOpen(open);
          if (!open) setPendingCheckIn(null);
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <span className="text-2xl">🟢</span>
              You're checked in!
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-foreground">
              Your shift has been logged at{' '}
              <strong>{pendingCheckIn?.displayTime ?? '—'}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground leading-relaxed">
            We'll now open WhatsApp with a pre-filled message so Tavara and your family
            know you're on the job. Just tap <strong>Send</strong> in WhatsApp — that's
            all you need to do.
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCheckInDialogOpen(false);
                const t = pendingCheckIn?.displayTime;
                setPendingCheckIn(null);
                toast.success(
                  t
                    ? `Shift logged at ${t}. You can notify Tavara from WhatsApp anytime.`
                    : 'Shift logged. You can notify Tavara from WhatsApp anytime.'
                );
              }}
            >
              Skip this time
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={() => {
                if (pendingCheckIn) {
                  try {
                    openCheckInWhatsApp({
                      caregiverName: pendingCheckIn.caregiverName,
                      clientName: pendingCheckIn.clientName,
                      shiftLabel: pendingCheckIn.shiftLabel,
                      scheduledStart: pendingCheckIn.scheduledStart,
                      startedAtIso: pendingCheckIn.startedAtIso,
                      completedItems: pendingCheckIn.completedItems,
                      totalItems: pendingCheckIn.totalItems,
                    });
                    toast.success(
                      `Shift logged at ${pendingCheckIn.displayTime}. WhatsApp opened — please tap Send to notify Tavara.`,
                      { duration: 5000 }
                    );
                  } catch (err) {
                    console.warn('[DailyChecklist] WhatsApp open failed:', err);
                    toast.error('Could not open WhatsApp. Your shift is still logged.');
                  }
                }
                setCheckInDialogOpen(false);
                setPendingCheckIn(null);
              }}
            >
              <Send className="h-4 w-4" />
              Open WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
