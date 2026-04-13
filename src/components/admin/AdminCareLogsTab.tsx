import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Pill, ClipboardCheck, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CHECKLIST_SECTIONS } from '@/components/professional/checklist/checklistSections';

interface AdminCareLogsTabProps {
  userId: string;
}

interface MedAdmin {
  id: string;
  medication_name: string;
  dosage: string | null;
  administered_at: string;
  administered_by_name: string;
  administered_by_role: string;
}

interface CareLog {
  id: string;
  professional_name: string;
  shift_date: string;
  shift_type: string | null;
  time_in: string | null;
  time_out: string | null;
  notes: string | null;
  checklist_data: Record<string, any>;
  created_at: string;
}

export const AdminCareLogsTab: React.FC<AdminCareLogsTabProps> = ({ userId }) => {
  const [medAdmins, setMedAdmins] = useState<MedAdmin[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch care plans for this family
      const { data: carePlans } = await supabase
        .from('care_plans')
        .select('id')
        .eq('family_id', userId);

      const carePlanIds = carePlans?.map(cp => cp.id) || [];

      // Fetch medication administrations
      if (carePlanIds.length > 0) {
        const { data: meds } = await supabase
          .from('medications')
          .select('id, name, dosage, care_plan_id')
          .in('care_plan_id', carePlanIds);

        if (meds && meds.length > 0) {
          const medIds = meds.map(m => m.id);
          const { data: admins } = await supabase
            .from('medication_administrations')
            .select('id, medication_id, administered_at, administered_by, administered_by_role, status')
            .in('medication_id', medIds)
            .eq('status', 'administered')
            .order('administered_at', { ascending: false })
            .limit(20);

          if (admins && admins.length > 0) {
            const adminByIds = [...new Set(admins.map(a => a.administered_by))];
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', adminByIds);

            const nameMap: Record<string, string> = {};
            profiles?.forEach(p => { nameMap[p.id] = p.full_name || 'Unknown'; });

            const medMap: Record<string, { name: string; dosage: string | null }> = {};
            meds.forEach(m => { medMap[m.id] = { name: m.name, dosage: m.dosage }; });

            setMedAdmins(admins.map(a => ({
              id: a.id,
              medication_name: medMap[a.medication_id]?.name || 'Unknown',
              dosage: medMap[a.medication_id]?.dosage || null,
              administered_at: a.administered_at,
              administered_by_name: nameMap[a.administered_by] || 'Unknown',
              administered_by_role: a.administered_by_role || 'Unknown',
            })));
          }
        }
      }

      // Fetch daily care logs
      const { data: logs } = await supabase
        .from('daily_care_logs')
        .select('*')
        .eq('family_id', userId)
        .order('shift_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (logs && logs.length > 0) {
        const profIds = [...new Set(logs.map(l => l.professional_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', profIds);

        const nameMap: Record<string, string> = {};
        profiles?.forEach(p => { nameMap[p.id] = p.full_name || 'Unknown'; });

        setCareLogs(logs.map(l => ({
          id: l.id,
          professional_name: nameMap[l.professional_id] || 'Unknown',
          shift_date: l.shift_date,
          shift_type: l.shift_type,
          time_in: l.time_in,
          time_out: l.time_out,
          notes: l.notes,
          checklist_data: (l.checklist_data && typeof l.checklist_data === 'object' ? l.checklist_data : {}) as Record<string, any>,
          created_at: l.created_at || '',
        })));
      }
    } catch (err) {
      console.error('Error fetching care logs for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) next.delete(logId);
      else next.add(logId);
      return next;
    });
  };

  const getCompletionStats = (checklistData: Record<string, any>) => {
    let total = 0;
    let completed = 0;
    CHECKLIST_SECTIONS.forEach(section => {
      const saved = checklistData[section.title];
      if (saved && Array.isArray(saved)) {
        saved.forEach((item: any) => { total++; if (item.completed) completed++; });
      } else {
        total += section.items.length;
      }
    });
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading care logs...</span>
      </div>
    );
  }

  if (medAdmins.length === 0 && careLogs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No care logs or medication administrations found for this family.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Medication Administrations */}
      {medAdmins.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medication Administrations
              <Badge variant="secondary">{medAdmins.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {medAdmins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{admin.medication_name}</span>
                    {admin.dosage && <span className="text-muted-foreground">({admin.dosage})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{admin.administered_by_name}</span>
                    <Badge variant="outline" className="text-xs">{admin.administered_by_role}</Badge>
                    <span>{new Date(admin.administered_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Caregiver Shift Logs */}
      {careLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Caregiver Shift Logs
              <Badge variant="secondary">{careLogs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {careLogs.map(log => {
              const stats = getCompletionStats(log.checklist_data);
              const isExpanded = expandedLogs.has(log.id);

              return (
                <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleExpand(log.id)}>
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        <span className="text-sm font-medium">{log.shift_date}</span>
                        <span className="text-sm text-muted-foreground">— {log.professional_name}</span>
                        {log.shift_type && <Badge variant="outline" className="text-xs">{log.shift_type}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {log.time_in && log.time_out ? `${log.time_in} – ${log.time_out}` : ''}
                        </span>
                        <Badge variant={stats.percent === 100 ? 'default' : 'secondary'} className="text-xs">
                          {stats.completed}/{stats.total}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 border border-t-0 rounded-b-lg space-y-3">
                      {/* Checklist sections */}
                      {CHECKLIST_SECTIONS.map(section => {
                        const saved = log.checklist_data[section.title];
                        if (!saved || !Array.isArray(saved)) return null;
                        const sectionCompleted = saved.filter((i: any) => i.completed).length;

                        return (
                          <div key={section.title} className="space-y-1">
                            <h4 className="text-xs font-medium flex items-center gap-1.5">
                              {section.title}
                              <span className="text-muted-foreground">({sectionCompleted}/{saved.length})</span>
                            </h4>
                            <div className="pl-3 space-y-0.5">
                              {saved.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs">
                                  <span>{item.completed ? '✅' : '❌'}</span>
                                  <span className={item.completed ? '' : 'text-muted-foreground'}>{item.task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Notes */}
                      {log.notes && (
                        <div className="bg-muted/50 rounded-md p-2">
                          <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Nurse Notes
                          </h4>
                          <p className="text-xs text-muted-foreground">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
